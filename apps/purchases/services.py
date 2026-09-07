from decimal import Decimal
from typing import Any
from django.db.models import Sum
from django.core.exceptions import ValidationError
from django.db import transaction
from apps.inventory.services import InventoryCostService, InventoryReversalService
from apps.inventory.models import (
    Ingredient,
    InventoryTransaction,
    InventoryTransactionType,
    UNIT_TO_BASE_FACTOR,
)
from apps.organizations.models import Organization
from apps.purchases.models import (
    Purchase,
    PurchaseAdditionalCost,
    PurchaseItem,
    PurchaseStatus,
    Supplier,
    SupplierPayment,
    SupplierPaymentMethod,
    SupplierTransaction,
    SupplierTransactionType,
    AccountDirection,
)


ALLOWED_UNITS_BY_TYPE: dict[str, set[str]] = {
    "weight": {"g", "kg"},
    "volume": {"ml", "l"},
    "count": {"piece"},
}


class PurchaseService:
    @staticmethod
    @transaction.atomic
    def create_purchase(
        *,
        organization: Organization,
        purchased_at: Any,
        items: list[dict[str, Any]],
        supplier: Supplier | None = None,
        additional_costs: list[dict[str, Any]] | None = None,
        note: str = "",
    ) -> Purchase:
        if not items:
            raise ValidationError(
                {
                    "items": (
                        "خرید باید حداقل یک قلم داشته باشد."
                    )
                }
            )

        if supplier is not None:
            if supplier.organization_id != organization.id:
                raise ValidationError(
                    {
                        "supplier": (
                            "تأمین‌کننده متعلق به این "
                            "کسب‌وکار نیست."
                        )
                    }
                )

            if not supplier.is_active:
                raise ValidationError(
                    {
                        "supplier": (
                            "این تأمین‌کننده غیرفعال است."
                        )
                    }
                )

        purchase = Purchase.objects.create(
            organization=organization,
            supplier=supplier,
            purchased_at=purchased_at,
            note=note,
        )

        for item_data in items:
            PurchaseService._create_purchase_item(
                purchase=purchase,
                organization=organization,
                item_data=item_data,
            )

        for cost_data in additional_costs or []:
            PurchaseService._create_additional_cost(
                purchase=purchase,
                cost_data=cost_data,
            )

        # ----------------------------------------------------
        # Supplier account entry
        # ----------------------------------------------------
        #
        # Only the actual purchase items are recorded as
        # payable to the supplier.
        #
        # Additional costs are kept separate because they may
        # belong to transport, shipping, insurance, etc.
        #
        if supplier is not None:
            purchase_amount = (
                PurchaseItem.objects
                .filter(purchase=purchase)
                .aggregate(
                    total=Sum("total_price")
                )
                .get("total")
                or Decimal("0")
            )

            if purchase_amount > Decimal("0"):
                SupplierTransaction.objects.create(
                    organization=organization,
                    supplier=supplier,
                    transaction_type=(
                        SupplierTransactionType.PURCHASE
                    ),
                    direction=AccountDirection.CREDIT,
                    amount=purchase_amount,
                    purchase=purchase,
                    note="ثبت خرید",
                )

        return purchase

    @staticmethod
    def _create_purchase_item(
        *,
        purchase: Purchase,
        organization: Organization,
        item_data: dict[str, Any],
    ) -> PurchaseItem:
        ingredient: Ingredient = item_data["ingredient"]

        if ingredient.organization_id != organization.id:
            raise ValidationError(
                {
                    "ingredient": (
                        "ماده اولیه متعلق به این "
                        "کسب‌وکار نیست."
                    )
                }
            )

        if not ingredient.is_active:
            raise ValidationError(
                {
                    "ingredient": (
                        "این ماده اولیه غیرفعال است."
                    )
                }
            )

        quantity = Decimal(
            str(item_data["quantity"])
        )

        unit = str(item_data["unit"])

        if quantity <= Decimal("0"):
            raise ValidationError(
                {
                    "quantity": (
                        "مقدار خرید باید بیشتر از صفر باشد."
                    )
                }
            )

        valid_units = ALLOWED_UNITS_BY_TYPE.get(
            ingredient.unit_type,
            set(),
        )

        if unit not in valid_units:
            raise ValidationError(
                {
                    "unit": (
                        "واحد انتخاب‌شده برای این "
                        "ماده اولیه معتبر نیست."
                    )
                }
            )

        unit_price = Decimal(
            str(item_data["unit_price"])
        )

        if unit_price < Decimal("0"):
            raise ValidationError(
                {
                    "unit_price": (
                        "قیمت واحد نمی‌تواند منفی باشد."
                    )
                }
            )

        discount = Decimal(
            str(
                item_data.get(
                    "discount",
                    Decimal("0"),
                )
            )
        )

        if discount < Decimal("0"):
            raise ValidationError(
                {
                    "discount": (
                        "تخفیف نمی‌تواند منفی باشد."
                    )
                }
            )

        base_quantity = (
            quantity * UNIT_TO_BASE_FACTOR[unit]
        )

        gross_total = quantity * unit_price

        total_price = gross_total - discount

        if total_price < Decimal("0"):
            raise ValidationError(
                {
                    "discount": (
                        "تخفیف نمی‌تواند از مبلغ "
                        "خرید بیشتر باشد."
                    )
                }
            )

        unit_cost = (
            total_price / base_quantity
        )

        purchase_item = PurchaseItem.objects.create(
            purchase=purchase,
            ingredient=ingredient,
            quantity=quantity,
            unit=unit,
            base_quantity=base_quantity,
            unit_price=unit_price,
            discount=discount,
            total_price=total_price,
        )

        InventoryCostService.increase_stock(
            ingredient=ingredient,
            quantity=base_quantity,
            total_cost=total_price,
        )

        InventoryTransaction.objects.create(
            organization=organization,
            ingredient=ingredient,
            transaction_type=(
                InventoryTransactionType.PURCHASE
            ),
            quantity=base_quantity,
            unit_cost=unit_cost,
            total_cost=total_price,
            purchase_item=purchase_item,
        )

        return purchase_item

    @staticmethod
    def _create_additional_cost(
        *,
        purchase: Purchase,
        cost_data: dict[str, Any],
    ) -> PurchaseAdditionalCost:
        amount = Decimal(
            str(cost_data["amount"])
        )

        if amount <= Decimal("0"):
            raise ValidationError(
                {
                    "amount": (
                        "هزینه جانبی باید بیشتر "
                        "از صفر باشد."
                    )
                }
            )

        return PurchaseAdditionalCost.objects.create(
            purchase=purchase,
            cost_type=cost_data["cost_type"],
            amount=amount,
            note=cost_data.get("note", ""),
        )


    




class SupplierAccountService:
    @staticmethod
    def get_account(
        *,
        organization: Organization,
        supplier: Supplier,
    ) -> dict[str, Any]:
        if supplier.organization_id != organization.id:
            raise ValidationError(
                {
                    "supplier": (
                        "این تأمین‌کننده متعلق به کسب‌وکار شما نیست."
                    )
                }
            )

        transactions = SupplierTransaction.objects.filter(
            organization=organization,
            supplier=supplier,
        )

        debit = (
            transactions
            .filter(direction=AccountDirection.DEBIT)
            .aggregate(total=Sum("amount"))
            .get("total")
            or Decimal("0")
        )

        credit = (
            transactions
            .filter(direction=AccountDirection.CREDIT)
            .aggregate(total=Sum("amount"))
            .get("total")
            or Decimal("0")
        )

        if credit > debit:
            balance = credit - debit
            direction = AccountDirection.CREDIT

        elif debit > credit:
            balance = debit - credit
            direction = AccountDirection.DEBIT

        else:
            balance = Decimal("0")
            direction = None

        return {
            "supplier": supplier,
            "debit": debit,
            "credit": credit,
            "balance": balance,
            "direction": direction,
        }



class SupplierService:
    @staticmethod
    def create_supplier(
        *,
        organization: Organization,
        name: str,
        phone: str = "",
        is_active: bool = True,
    ) -> Supplier:
        name = name.strip()

        if not name:
            raise ValidationError(
                {
                    "name": (
                        "نام تأمین‌کننده نمی‌تواند خالی باشد."
                    )
                }
            )

        supplier = Supplier.objects.create(
            organization=organization,
            name=name,
            phone=phone.strip(),
            is_active=is_active,
        )

        return supplier

    @staticmethod
    def update_supplier(
        *,
        organization: Organization,
        supplier: Supplier,
        name: str | None = None,
        phone: str | None = None,
        is_active: bool | None = None,
    ) -> Supplier:
        if supplier.organization_id != organization.id:
            raise ValidationError(
                {
                    "supplier": (
                        "این تأمین‌کننده متعلق به "
                        "کسب‌وکار شما نیست."
                    )
                }
            )

        if name is not None:
            name = name.strip()

            if not name:
                raise ValidationError(
                    {
                        "name": (
                            "نام تأمین‌کننده نمی‌تواند "
                            "خالی باشد."
                        )
                    }
                )

            supplier.name = name

        if phone is not None:
            supplier.phone = phone.strip()

        if is_active is not None:
            supplier.is_active = is_active

        supplier.save()

        return supplier


class SupplierTransactionReversalService:
    @staticmethod
    @transaction.atomic
    def reverse_transaction(
        *,
        transaction: SupplierTransaction,
        created_by=None,
        note: str = "",
    ) -> SupplierTransaction:
        if transaction.reversal_transactions.exists():
            raise ValidationError(
                "این تراکنش قبلاً معکوس شده است."
            )

        if transaction.transaction_type == (
            SupplierTransactionType.REVERSAL
        ):
            raise ValidationError(
                "یک تراکنش معکوس را نمی‌توان دوباره معکوس کرد."
            )

        reversed_direction = (
            AccountDirection.CREDIT
            if transaction.direction
            == AccountDirection.DEBIT
            else AccountDirection.DEBIT
        )

        return SupplierTransaction.objects.create(
            organization=transaction.organization,
            supplier=transaction.supplier,
            transaction_type=(
                SupplierTransactionType.REVERSAL
            ),
            direction=reversed_direction,
            amount=transaction.amount,
            purchase=transaction.purchase,
            payment=transaction.payment,
            reverses=transaction,
            note=note,
        )


class PurchaseCancellationService:
    @staticmethod
    @transaction.atomic
    def cancel_purchase(
        *,
        organization: Organization,
        purchase_id: int,
        note: str = "",
    ) -> Purchase:
        # ----------------------------------------------------
        # Get and lock purchase
        # ----------------------------------------------------

        purchase = (
            Purchase.objects
            .select_for_update()
            .select_related("supplier")
            .get(
                pk=purchase_id,
                organization=organization,
            )
        )

        # ----------------------------------------------------
        # Validate purchase status
        # ----------------------------------------------------

        if purchase.status == PurchaseStatus.CANCELLED:
            raise ValidationError(
                {
                    "purchase": (
                        "این خرید قبلاً لغو شده است."
                    )
                }
            )

        # ----------------------------------------------------
        # Get purchase inventory transactions
        # ----------------------------------------------------

        inventory_transactions = list(
            InventoryTransaction.objects
            .select_related("ingredient")
            .filter(
                organization=organization,
                purchase_item__purchase=purchase,
                transaction_type=(
                    InventoryTransactionType.PURCHASE
                ),
                reverses__isnull=True,
            )
            .order_by("id")
        )

        if not inventory_transactions:
            raise ValidationError(
                {
                    "purchase": (
                        "برای این خرید تراکنش انباری "
                        "قابل برگشت وجود ندارد."
                    )
                }
            )

        # ----------------------------------------------------
        # Validate every inventory transaction BEFORE
        # creating any reversal.
        # ----------------------------------------------------

        for inventory_transaction in inventory_transactions:
            ingredient = (
                Ingredient.objects
                .select_for_update()
                .get(
                    pk=inventory_transaction.ingredient_id
                )
            )

            if (
                ingredient.current_stock
                < inventory_transaction.quantity
            ):
                raise ValidationError(
                    {
                        "purchase": (
                            "موجودی فعلی برای لغو کامل "
                            "این خرید کافی نیست."
                        ),
                        "ingredient": ingredient.name,
                    }
                )

        # ----------------------------------------------------
        # Reverse inventory transactions
        # ----------------------------------------------------

        for inventory_transaction in inventory_transactions:
            InventoryReversalService.reverse_transaction(
                transaction=inventory_transaction,
                note=(
                    note
                    or f"لغو خرید #{purchase.id}"
                ),
            )

        # ----------------------------------------------------
        # Reverse supplier purchase transaction
        # ----------------------------------------------------

        if purchase.supplier_id is not None:
            supplier_transactions = list(
                SupplierTransaction.objects
                .select_for_update()
                .filter(
                    organization=organization,
                    supplier_id=purchase.supplier_id,
                    purchase=purchase,
                    transaction_type=(
                        SupplierTransactionType.PURCHASE
                    ),
                    reverses__isnull=True,
                )
                .order_by("id")
            )

            for supplier_transaction in supplier_transactions:
                SupplierTransactionReversalService.reverse_transaction(
                    transaction=supplier_transaction,
                    note=(
                        note
                        or f"لغو خرید #{purchase.id}"
                    ),
                )

        # ----------------------------------------------------
        # Mark purchase as cancelled
        # ----------------------------------------------------

        purchase.status = PurchaseStatus.CANCELLED

        purchase.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return purchase



class SupplierPaymentService:
    @staticmethod
    @transaction.atomic
    def create_payment(
        *,
        organization: Organization,
        supplier: Supplier | None = None,
        amount: Decimal | None = None,
        method: str,
        paid_at: Any,
        purchase: Purchase | None = None,
        note: str = "",
    ) -> SupplierPayment:

        # ----------------------------------------------------
        # Purchase is required for both payment types
        # ----------------------------------------------------

        if purchase is None:
            raise ValidationError(
                {
                    "purchase": (
                        "پرداخت باید به یک خرید مرتبط باشد."
                    )
                }
            )

        # ----------------------------------------------------
        # Validate purchase organization
        # ----------------------------------------------------

        if purchase.organization_id != organization.id:
            raise ValidationError(
                {
                    "purchase": (
                        "این خرید متعلق به "
                        "کسب‌وکار شما نیست."
                    )
                }
            )

        if purchase.status == PurchaseStatus.CANCELLED:
            raise ValidationError(
                {
                    "purchase": (
                        "برای خرید لغوشده "
                        "نمی‌توان پرداخت ثبت کرد."
                    )
                }
            )

        # ----------------------------------------------------
        # Lock purchase
        # ----------------------------------------------------

        purchase = (
            Purchase.objects
            .select_for_update()
            .get(pk=purchase.pk)
        )

        # ----------------------------------------------------
        # Calculate purchase amounts from database
        # ----------------------------------------------------

        items_total = (
            PurchaseItem.objects
            .filter(purchase=purchase)
            .aggregate(
                total=Sum("total_price"),
            )
            .get("total")
            or Decimal("0")
        )

        additional_costs_total = (
            PurchaseAdditionalCost.objects
            .filter(purchase=purchase)
            .aggregate(
                total=Sum("amount"),
            )
            .get("total")
            or Decimal("0")
        )

        grand_total = (
            items_total + additional_costs_total
        )

        # ====================================================
        # CASE 1: Purchase WITHOUT supplier
        # ====================================================

        if purchase.supplier_id is None:

            # Supplier must not be provided.
            if supplier is not None:
                raise ValidationError(
                    {
                        "supplier": (
                            "این خرید تأمین‌کننده ندارد."
                        )
                    }
                )

            # The backend calculates the payment amount.
            if grand_total <= Decimal("0"):
                raise ValidationError(
                    {
                        "purchase": (
                            "مبلغ نهایی خرید باید "
                            "بیشتر از صفر باشد."
                        )
                    }
                )

            previous_payments = (
                SupplierPayment.objects
                .filter(
                    organization=organization,
                    supplier__isnull=True,
                    purchase=purchase,
                )
                .aggregate(
                    total=Sum("amount"),
                )
                .get("total")
                or Decimal("0")
            )

            remaining_amount = (
                grand_total - previous_payments
            )

            if remaining_amount <= Decimal("0"):
                raise ValidationError(
                    {
                        "purchase": (
                            "این خرید قبلاً "
                            "به‌طور کامل پرداخت شده است."
                        )
                    }
                )

            # Ignore any client-provided amount.
            payment_amount = remaining_amount

        # ====================================================
        # CASE 2: Purchase WITH supplier
        # ====================================================

        else:

            # Supplier is required.
            if supplier is None:
                raise ValidationError(
                    {
                        "supplier": (
                            "برای این خرید باید "
                            "تأمین‌کننده مشخص شود."
                        )
                    }
                )

            # Supplier must belong to the same organization.
            if supplier.organization_id != organization.id:
                raise ValidationError(
                    {
                        "supplier": (
                            "این تأمین‌کننده متعلق به "
                            "کسب‌وکار شما نیست."
                        )
                    }
                )

            # Supplier must be active.
            if not supplier.is_active:
                raise ValidationError(
                    {
                        "supplier": (
                            "این تأمین‌کننده غیرفعال است."
                        )
                    }
                )

            # Supplier must match the purchase supplier.
            if purchase.supplier_id != supplier.id:
                raise ValidationError(
                    {
                        "purchase": (
                            "این خرید متعلق به "
                            "این تأمین‌کننده نیست."
                        )
                    }
                )

            # ------------------------------------------------
            # Supplier payable = ONLY items_total
            # Additional costs are not supplier debt.
            # ------------------------------------------------

            previous_payments = (
                SupplierPayment.objects
                .filter(
                    organization=organization,
                    supplier=supplier,
                    purchase=purchase,
                )
                .aggregate(
                    total=Sum("amount"),
                )
                .get("total")
                or Decimal("0")
            )

            remaining_payable = (
                items_total - previous_payments
            )

            if remaining_payable <= Decimal("0"):
                raise ValidationError(
                    {
                        "purchase": (
                            "این خرید قبلاً "
                            "به‌طور کامل پرداخت شده است."
                        )
                    }
                )

            # Amount is required for supplier purchases.
            if amount is None:
                raise ValidationError(
                    {
                        "amount": (
                            "مبلغ پرداخت الزامی است."
                        )
                    }
                )

            if amount <= Decimal("0"):
                raise ValidationError(
                    {
                        "amount": (
                            "مبلغ پرداخت باید "
                            "بیشتر از صفر باشد."
                        )
                    }
                )

            if amount > remaining_payable:
                raise ValidationError(
                    {
                        "amount": (
                            "مبلغ پرداخت بیشتر از "
                            "مانده بدهی خرید است."
                        )
                    }
                )

            payment_amount = amount

        # ----------------------------------------------------
        # Create payment
        # ----------------------------------------------------

        payment = SupplierPayment.objects.create(
            organization=organization,
            supplier=supplier,
            purchase=purchase,
            amount=payment_amount,
            method=method,
            paid_at=paid_at,
            note=note,
        )

        # ----------------------------------------------------
        # Supplier ledger transaction
        #
        # Supplier-less purchases do NOT create a ledger
        # transaction.
        # ----------------------------------------------------

        if supplier is not None:
            SupplierTransaction.objects.create(
                organization=organization,
                supplier=supplier,
                transaction_type=(
                    SupplierTransactionType.PAYMENT
                ),
                direction=AccountDirection.DEBIT,
                amount=payment_amount,
                purchase=purchase,
                payment=payment,
                note=note,
            )

        return payment



class SupplierRefundService:
    @staticmethod
    @transaction.atomic
    def create_refund(
        *,
        organization: Organization,
        supplier: Supplier,
        amount: Decimal,
        purchase: Purchase,
        note: str = "",
    ) -> SupplierTransaction:
        if amount <= Decimal("0"):
            raise ValidationError(
                {
                    "amount": (
                        "مبلغ برگشت وجه باید بیشتر از صفر باشد."
                    )
                }
            )

        if supplier.organization_id != organization.id:
            raise ValidationError(
                {
                    "supplier": (
                        "این تأمین‌کننده متعلق به "
                        "کسب‌وکار شما نیست."
                    )
                }
            )

        if not supplier.is_active:
            raise ValidationError(
                {
                    "supplier": (
                        "این تأمین‌کننده غیرفعال است."
                    )
                }
            )

        if purchase.organization_id != organization.id:
            raise ValidationError(
                {
                    "purchase": (
                        "این خرید متعلق به "
                        "کسب‌وکار شما نیست."
                    )
                }
            )

        if purchase.supplier_id != supplier.id:
            raise ValidationError(
                {
                    "purchase": (
                        "این خرید متعلق به "
                        "این تأمین‌کننده نیست."
                    )
                }
            )

        if purchase.status != PurchaseStatus.CANCELLED:
            raise ValidationError(
                {
                    "purchase": (
                        "فقط خرید لغوشده قابل برگشت وجه است."
                    )
                }
            )

        # ----------------------------------------------------
        # Total amount paid for this purchase
        # ----------------------------------------------------

        paid_amount = (
            SupplierPayment.objects
            .filter(
                organization=organization,
                supplier=supplier,
                purchase=purchase,
            )
            .aggregate(
                total=Sum("amount"),
            )
            .get("total")
            or Decimal("0")
        )

        # ----------------------------------------------------
        # Total supplier refunds already received
        # ----------------------------------------------------

        refunded_amount = (
            SupplierTransaction.objects
            .filter(
                organization=organization,
                supplier=supplier,
                purchase=purchase,
                transaction_type=(
                    SupplierTransactionType.REFUND
                ),
            )
            .aggregate(
                total=Sum("amount"),
            )
            .get("total")
            or Decimal("0")
        )

        refundable_amount = (
            paid_amount - refunded_amount
        )

        if refundable_amount <= Decimal("0"):
            raise ValidationError(
                {
                    "purchase": (
                        "برای این خرید مبلغی برای "
                        "برگشت وجه باقی نمانده است."
                    )
                }
            )

        if amount > refundable_amount:
            raise ValidationError(
                {
                    "amount": (
                        "مبلغ برگشت وجه بیشتر از "
                        "مبلغ قابل برگشت است."
                    )
                }
            )

        # ----------------------------------------------------
        # Supplier refund transaction
        # ----------------------------------------------------
        #
        # Purchase  -> CREDIT
        # Payment   -> DEBIT
        # Refund    -> CREDIT
        #
        # Refund received from supplier reduces the
        # amount that supplier owes us after cancellation.
        # ----------------------------------------------------

        return SupplierTransaction.objects.create(
            organization=organization,
            supplier=supplier,
            transaction_type=(
                SupplierTransactionType.REFUND
            ),
            direction=AccountDirection.CREDIT,
            amount=amount,
            purchase=purchase,
            note=note,
        )