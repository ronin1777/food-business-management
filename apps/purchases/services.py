from decimal import Decimal
from typing import Any
from django.db.models import Sum
from django.core.exceptions import ValidationError
from django.db import transaction
from apps.inventory.services import InventoryCostService
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


class SupplierPaymentService:
    @staticmethod
    @transaction.atomic
    def create_payment(
        *,
        organization: Organization,
        supplier: Supplier,
        amount: Decimal,
        method: str,
        paid_at: Any,
        purchase: Purchase | None = None,
        note: str = "",
    ) -> SupplierPayment:

        if supplier.organization_id != organization.id:
            raise ValidationError(
                {
                    "supplier": (
                        "این تأمین‌کننده متعلق به کسب‌وکار شما نیست."
                    )
                }
            )

        if not supplier.is_active:
            raise ValidationError(
                {
                    "supplier": "این تأمین‌کننده غیرفعال است."
                }
            )

        if amount <= Decimal("0"):
            raise ValidationError(
                {
                    "amount": (
                        "مبلغ پرداخت باید بیشتر از صفر باشد."
                    )
                }
            )

        if purchase is not None:
            if purchase.organization_id != organization.id:
                raise ValidationError(
                    {
                        "purchase": (
                            "این خرید متعلق به کسب‌وکار شما نیست."
                        )
                    }
                )

            if purchase.supplier_id != supplier.id:
                raise ValidationError(
                    {
                        "purchase": (
                            "این خرید متعلق به این تأمین‌کننده نیست."
                        )
                    }
                )

        payment = SupplierPayment.objects.create(
            organization=organization,
            supplier=supplier,
            purchase=purchase,
            amount=amount,
            method=method,
            paid_at=paid_at,
            note=note,
        )

        SupplierTransaction.objects.create(
            organization=organization,
            supplier=supplier,
            transaction_type=SupplierTransactionType.PAYMENT,
            direction=AccountDirection.DEBIT,
            amount=amount,
            purchase=purchase,
            payment=payment,
            note=note,
        )

        return payment





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