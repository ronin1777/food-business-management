from decimal import Decimal
from typing import Any

from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.db.models import Sum
from apps.inventory.services import InventoryReversalService
from apps.inventory.models import (
    Ingredient,
    InventoryTransaction,
    InventoryTransactionType,
)
from apps.inventory.services import InventoryCostService
from apps.organizations.models import Organization

from .models import (
    Customer,
    CustomerAccountDirection,
    CustomerPayment,
    CustomerTransaction,
    CustomerTransactionType,
    Order,
    OrderItem,
    OrderItemIngredient,
    OrderPaymentStatus,
    OrderStatus,
)


class CustomerPaymentService:
    @staticmethod
    @transaction.atomic
    def create_payment(
        *,
        organization: Organization,
        customer: Customer,
        amount: Decimal,
        method: str,
        paid_at: Any,
        order: Order | None = None,
        note: str = "",
    ) -> CustomerPayment:
        if customer.organization_id != organization.id:
            raise ValidationError(
                {
                    "customer": (
                        "این مشتری متعلق به کسب‌وکار شما نیست."
                    )
                }
            )

        if not customer.is_active:
            raise ValidationError(
                {
                    "customer": (
                        "این مشتری غیرفعال است."
                    )
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

        if order is not None:
            if order.organization_id != organization.id:
                raise ValidationError(
                    {
                        "order": (
                            "این سفارش متعلق به "
                            "کسب‌وکار شما نیست."
                        )
                    }
                )

            if order.customer_id != customer.id:
                raise ValidationError(
                    {
                        "order": (
                            "این سفارش متعلق به این مشتری نیست."
                        )
                    }
                )

        payment = CustomerPayment.objects.create(
            organization=organization,
            customer=customer,
            order=order,
            amount=amount,
            method=method,
            paid_at=paid_at,
            note=note,
        )

        CustomerTransaction.objects.create(
            organization=organization,
            customer=customer,
            transaction_type=(
                CustomerTransactionType.PAYMENT
            ),
            direction=(
                CustomerAccountDirection.CREDIT
            ),
            amount=amount,
            order=order,
            payment=payment,
            note=note,
        )

        if order is not None:
            paid_amount = (
                CustomerPayment.objects
                .filter(order=order)
                .aggregate(
                    total=Sum("amount")
                )
                .get("total")
                or Decimal("0")
            )

            order_total = (
                OrderItem.objects
                .filter(order=order)
                .aggregate(
                    total=Sum("total_price")
                )
                .get("total")
                or Decimal("0")
            )

            if paid_amount >= order_total:
                order.payment_status = (
                    OrderPaymentStatus.PAID
                )
            elif paid_amount > Decimal("0"):
                order.payment_status = (
                    OrderPaymentStatus.PARTIALLY_PAID
                )
            else:
                order.payment_status = (
                    OrderPaymentStatus.UNPAID
                )

            order.save(
                update_fields=[
                    "payment_status",
                    "updated_at",
                ]
            )

        return payment


class CustomerAccountService:
    @staticmethod
    def get_account(
        *,
        organization: Organization,
        customer: Customer,
    ) -> dict[str, Any]:
        if customer.organization_id != organization.id:
            raise ValidationError(
                {
                    "customer": (
                        "این مشتری متعلق به کسب‌وکار شما نیست."
                    )
                }
            )

        transactions = CustomerTransaction.objects.filter(
            organization=organization,
            customer=customer,
        )

        debit = (
            transactions
            .filter(
                direction=CustomerAccountDirection.DEBIT,
            )
            .aggregate(
                total=Sum("amount")
            )
            .get("total")
            or Decimal("0")
        )

        credit = (
            transactions
            .filter(
                direction=CustomerAccountDirection.CREDIT,
            )
            .aggregate(
                total=Sum("amount")
            )
            .get("total")
            or Decimal("0")
        )

        if debit > credit:
            balance = debit - credit
            direction = CustomerAccountDirection.DEBIT

        elif credit > debit:
            balance = credit - debit
            direction = CustomerAccountDirection.CREDIT

        else:
            balance = Decimal("0")
            direction = None

        return {
            "customer": customer,
            "debit": debit,
            "credit": credit,
            "balance": balance,
            "direction": direction,
        }


class OrderService:
    @staticmethod
    @transaction.atomic
    def create_order(
        *,
        organization: Organization,
        ordered_at: Any,
        items: list[dict[str, Any]],
        customer: Customer | None = None,
        note: str = "",
    ) -> Order:
        if not items:
            raise ValidationError(
                {
                    "items": (
                        "سفارش باید حداقل یک قلم داشته باشد."
                    )
                }
            )

        if customer is not None:
            if customer.organization_id != organization.id:
                raise ValidationError(
                    {
                        "customer": (
                            "این مشتری متعلق به "
                            "کسب‌وکار شما نیست."
                        )
                    }
                )

            if not customer.is_active:
                raise ValidationError(
                    {
                        "customer": (
                            "این مشتری غیرفعال است."
                        )
                    }
                )

        order = Order.objects.create(
            organization=organization,
            customer=customer,
            ordered_at=ordered_at,
            note=note,
        )

        for item_data in items:
            OrderService._create_order_item(
                order=order,
                organization=organization,
                ordered_at=ordered_at,
                item_data=item_data,
            )

        # ثبت فروش در حساب مشتری
        # فقط زمانی که سفارش مشتری داشته باشد.
        if customer is not None:
            total_amount = (
                OrderItem.objects
                .filter(order=order)
                .aggregate(
                    total=Sum("total_price")
                )
                .get("total")
                or Decimal("0")
            )

            CustomerTransaction.objects.create(
                organization=organization,
                customer=customer,
                transaction_type=(
                    CustomerTransactionType.SALE
                ),
                direction=(
                    CustomerAccountDirection.DEBIT
                ),
                amount=total_amount,
                order=order,
                note="ثبت فروش",
            )

        return order

    @staticmethod
    def _create_order_item(
        *,
        order: Order,
        organization: Organization,
        ordered_at: Any,
        item_data: dict[str, Any],
    ) -> OrderItem:
        product = item_data["product"]

        if product.organization_id != organization.id:
            raise ValidationError(
                {
                    "product": (
                        "این محصول متعلق به "
                        "کسب‌وکار شما نیست."
                    )
                }
            )

        if not product.is_active:
            raise ValidationError(
                {
                    "product": (
                        "این محصول غیرفعال است."
                    )
                }
            )

        quantity = int(item_data["quantity"])

        if quantity <= 0:
            raise ValidationError(
                {
                    "quantity": (
                        "تعداد محصول باید بیشتر "
                        "از صفر باشد."
                    )
                }
            )

        recipe = (
            product.recipes
            .filter(
                valid_from__lte=ordered_at,
            )
            .filter(
                models.Q(valid_to__isnull=True)
                | models.Q(valid_to__gt=ordered_at)
            )
            .order_by("-version")
            .first()
        )

        if recipe is None:
            raise ValidationError(
                {
                    "product": (
                        "برای این محصول دستور تهیه "
                        "معتبر وجود ندارد."
                    )
                }
            )

        order_item = OrderItem.objects.create(
            order=order,
            product=product,
            recipe=recipe,
            quantity=quantity,
            unit_price=product.selling_price,
            total_price=(
                product.selling_price
                * quantity
            ),
            material_cost=Decimal("0"),
        )

        material_cost = Decimal("0")

        recipe_items = (
            recipe.items
            .select_related("ingredient")
        )

        for recipe_item in recipe_items:
            ingredient: Ingredient = (
                recipe_item.ingredient
            )

            if ingredient.organization_id != organization.id:
                raise ValidationError(
                    {
                        "recipe": (
                            "یکی از مواد اولیه دستور تهیه "
                            "متعلق به این کسب‌وکار نیست."
                        )
                    }
                )

            required_quantity = (
                recipe_item.base_quantity
                * quantity
            )

            result = InventoryCostService.decrease_stock(
                ingredient=ingredient,
                quantity=required_quantity,
            )

            ingredient_usage = (
                OrderItemIngredient.objects.create(
                    order_item=order_item,
                    ingredient=ingredient,
                    quantity=required_quantity,
                    unit_cost=result.unit_cost,
                    total_cost=result.total_cost,
                )
            )

            InventoryTransaction.objects.create(
                organization=organization,
                ingredient=ingredient,
                transaction_type=(
                    InventoryTransactionType.ORDER_USAGE
                ),
                quantity=-required_quantity,
                unit_cost=result.unit_cost,
                total_cost=result.total_cost,
                order_item_ingredient=ingredient_usage,
            )

            material_cost += result.total_cost

        order_item.material_cost = material_cost

        order_item.save(
            update_fields=[
                "material_cost",
            ]
        )

        return order_item




class OrderCancellationService:
    @staticmethod
    @transaction.atomic
    def cancel_order(
        *,
        organization: Organization,
        order_id: int,
        note: str = "",
    ) -> Order:
        order = (
            Order.objects
            .select_for_update()
            .select_related("customer")
            .get(
                pk=order_id,
                organization=organization,
            )
        )

        if order.status == OrderStatus.CANCELLED:
            raise ValidationError(
                {
                    "order": (
                        "این سفارش قبلاً لغو شده است."
                    )
                }
            )

        inventory_transactions = (
            InventoryTransaction.objects
            .select_related("ingredient")
            .filter(
                organization=organization,
                order_item_ingredient__order_item__order=order,
                transaction_type=(
                    InventoryTransactionType.ORDER_USAGE
                ),
                reverses__isnull=True,
            )
            .order_by("id")
        )

        for inventory_transaction in inventory_transactions:
            InventoryReversalService.reverse_transaction(
                transaction=inventory_transaction,
                note=(
                    note
                    or f"لغو سفارش #{order.id}"
                ),
            )

        if order.customer_id is not None:
            sale_transactions = (
                CustomerTransaction.objects
                .select_for_update()
                .filter(
                    organization=organization,
                    customer_id=order.customer_id,
                    order=order,
                    transaction_type=(
                        CustomerTransactionType.SALE
                    ),
                    reverses__isnull=True,
                )
            )

            for sale_transaction in sale_transactions:
                CustomerTransactionReversalService.reverse_transaction(
                    transaction=sale_transaction,
                    note=(
                        note
                        or f"لغو سفارش #{order.id}"
                    ),
                )

        order.status = OrderStatus.CANCELLED

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return order




class CustomerService:
    @staticmethod
    def create_customer(
        *,
        organization: Organization,
        name: str,
        phone: str = "",
        note: str = "",
        is_active: bool = True,
    ) -> Customer:
        name = name.strip()

        if not name:
            raise ValidationError(
                {
                    "name": (
                        "نام مشتری نمی‌تواند خالی باشد."
                    )
                }
            )

        return Customer.objects.create(
            organization=organization,
            name=name,
            phone=phone.strip(),
            note=note.strip(),
            is_active=is_active,
        )

    @staticmethod
    def update_customer(
        *,
        organization: Organization,
        customer: Customer,
        name: str | None = None,
        phone: str | None = None,
        note: str | None = None,
        is_active: bool | None = None,
    ) -> Customer:
        if customer.organization_id != organization.id:
            raise ValidationError(
                {
                    "customer": (
                        "این مشتری متعلق به "
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
                            "نام مشتری نمی‌تواند "
                            "خالی باشد."
                        )
                    }
                )

            customer.name = name

        if phone is not None:
            customer.phone = phone.strip()

        if note is not None:
            customer.note = note.strip()

        if is_active is not None:
            customer.is_active = is_active

        customer.save()

        return customer


class CustomerTransactionReversalService:
    @staticmethod
    @transaction.atomic
    def reverse_transaction(
        *,
        transaction: CustomerTransaction,
        created_by=None,
        note: str = "",
    ) -> CustomerTransaction:
        if transaction.reversal_transactions.exists():
            raise ValidationError(
                "این تراکنش قبلاً معکوس شده است."
            )

        if transaction.transaction_type == (
            CustomerTransactionType.REVERSAL
        ):
            raise ValidationError(
                "یک تراکنش معکوس را نمی‌توان دوباره معکوس کرد."
            )

        reversed_direction = (
            CustomerAccountDirection.CREDIT
            if transaction.direction
            == CustomerAccountDirection.DEBIT
            else CustomerAccountDirection.DEBIT
        )

        return CustomerTransaction.objects.create(
            organization=transaction.organization,
            customer=transaction.customer,
            transaction_type=(
                CustomerTransactionType.REVERSAL
            ),
            direction=reversed_direction,
            amount=transaction.amount,
            order=transaction.order,
            payment=transaction.payment,
            reverses=transaction,
            note=note,
        )