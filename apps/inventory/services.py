from decimal import Decimal, ROUND_HALF_UP
from typing import NamedTuple
from decimal import Decimal

from django.core.exceptions import ValidationError

from apps.organizations.models import Organization
from django.core.exceptions import ValidationError
from django.db import transaction

from .models import Ingredient, InventoryTransaction, InventoryTransactionType


MONEY_QUANTIZER = Decimal("0.01")
UNIT_COST_QUANTIZER = Decimal("0.000001")


def quantize_money(value: Decimal) -> Decimal:
    return value.quantize(
        MONEY_QUANTIZER,
        rounding=ROUND_HALF_UP,
    )


def quantize_unit_cost(value: Decimal) -> Decimal:
    return value.quantize(
        UNIT_COST_QUANTIZER,
        rounding=ROUND_HALF_UP,
    )


class StockDecreaseResult(NamedTuple):
    unit_cost: Decimal
    total_cost: Decimal


class InventoryCostService:

    @staticmethod
    @transaction.atomic
    def increase_stock(
        *,
        ingredient: Ingredient,
        quantity: Decimal,
        total_cost: Decimal,
    ) -> Decimal:
        if quantity <= Decimal("0"):
            raise ValidationError(
                "مقدار افزایش موجودی باید بیشتر از صفر باشد."
            )

        if total_cost < Decimal("0"):
            raise ValidationError(
                "ارزش موجودی نمی‌تواند منفی باشد."
            )

        ingredient = (
            Ingredient.objects
            .select_for_update()
            .get(pk=ingredient.pk)
        )

        total_cost = quantize_money(total_cost)

        new_stock = ingredient.current_stock + quantity
        new_value = (
            ingredient.current_inventory_value
            + total_cost
        )

        ingredient.current_stock = new_stock
        ingredient.current_inventory_value = new_value

        ingredient.save(
            update_fields=[
                "current_stock",
                "current_inventory_value",
                "updated_at",
            ]
        )

        return quantize_unit_cost(
            new_value / new_stock
        )

    @staticmethod
    @transaction.atomic
    def decrease_stock(
        *,
        ingredient: Ingredient,
        quantity: Decimal,
    ) -> StockDecreaseResult:
        if quantity <= Decimal("0"):
            raise ValidationError(
                "مقدار کاهش موجودی باید بیشتر از صفر باشد."
            )

        ingredient = (
            Ingredient.objects
            .select_for_update()
            .get(pk=ingredient.pk)
        )

        if ingredient.current_stock < quantity:
            raise ValidationError(
                "موجودی ماده اولیه کافی نیست."
            )

        unit_cost = ingredient.average_unit_cost

        total_cost = quantize_money(
            quantity * unit_cost
        )

        if total_cost > ingredient.current_inventory_value:
            total_cost = ingredient.current_inventory_value

        new_stock = ingredient.current_stock - quantity
        new_value = (
            ingredient.current_inventory_value
            - total_cost
        )

        if new_stock == Decimal("0"):
            new_value = Decimal("0")

        ingredient.current_stock = new_stock
        ingredient.current_inventory_value = new_value

        ingredient.save(
            update_fields=[
                "current_stock",
                "current_inventory_value",
                "updated_at",
            ]
        )

        return StockDecreaseResult(
            unit_cost=quantize_unit_cost(unit_cost),
            total_cost=total_cost,
        )


class IngredientService:
    @staticmethod
    def create_ingredient(
        *,
        organization: Organization,
        name: str,
        unit_type: str,
        is_active: bool = True,
    ) -> Ingredient:
        name = name.strip()

        if not name:
            raise ValidationError(
                {
                    "name": (
                        "نام ماده اولیه نمی‌تواند خالی باشد."
                    )
                }
            )

        if Ingredient.objects.filter(
            organization=organization,
            name=name,
        ).exists():
            raise ValidationError(
                {
                    "name": (
                        "ماده اولیه‌ای با این نام "
                        "قبلاً وجود دارد."
                    )
                }
            )

        return Ingredient.objects.create(
            organization=organization,
            name=name,
            unit_type=unit_type,
            is_active=is_active,
        )

    @staticmethod
    def update_ingredient(
        *,
        organization: Organization,
        ingredient: Ingredient,
        name: str | None = None,
        unit_type: str | None = None,
        is_active: bool | None = None,
    ) -> Ingredient:
        if ingredient.organization_id != organization.id:
            raise ValidationError(
                {
                    "ingredient": (
                        "این ماده اولیه متعلق به "
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
                            "نام ماده اولیه نمی‌تواند "
                            "خالی باشد."
                        )
                    }
                )

            if Ingredient.objects.filter(
                organization=organization,
                name=name,
            ).exclude(pk=ingredient.pk).exists():
                raise ValidationError(
                    {
                        "name": (
                            "ماده اولیه‌ای با این نام "
                            "قبلاً وجود دارد."
                        )
                    }
                )

            ingredient.name = name

        if unit_type is not None:
            if ingredient.unit_type != unit_type:
                if (
                    ingredient.current_stock
                    != Decimal("0")
                    or ingredient.current_inventory_value
                    != Decimal("0")
                ):
                    raise ValidationError(
                        {
                            "unit_type": (
                                "واحد ماده اولیه‌ای که "
                                "موجودی دارد قابل تغییر نیست."
                            )
                        }
                    )

                ingredient.unit_type = unit_type

        if is_active is not None:
            ingredient.is_active = is_active

        ingredient.save()

        return ingredient



class InventoryReversalService:
    @staticmethod
    @transaction.atomic
    def reverse_transaction(
        *,
        transaction: InventoryTransaction,
        created_by=None,
        note: str = "",
    ) -> InventoryTransaction:
        if transaction.reversal_transactions.exists():
            raise ValidationError(
                "این تراکنش قبلاً معکوس شده است."
            )

        if transaction.transaction_type == (
            InventoryTransactionType.REVERSAL
        ):
            raise ValidationError(
                "یک تراکنش معکوس را نمی‌توان دوباره معکوس کرد."
            )

        ingredient = (
            Ingredient.objects
            .select_for_update()
            .get(pk=transaction.ingredient_id)
        )

        # Reverse a stock increase.
        if transaction.quantity > Decimal("0"):
            if ingredient.current_stock < transaction.quantity:
                raise ValidationError(
                    "موجودی فعلی برای معکوس کردن این تراکنش کافی نیست."
                )

            ingredient.current_stock -= transaction.quantity
            ingredient.current_inventory_value -= (
                transaction.total_cost
            )

            if ingredient.current_inventory_value < Decimal("0"):
                ingredient.current_inventory_value = Decimal("0")

        # Reverse a stock decrease.
        else:
            quantity_to_restore = abs(transaction.quantity)

            ingredient.current_stock += quantity_to_restore
            ingredient.current_inventory_value += (
                transaction.total_cost
            )

        ingredient.save(
            update_fields=[
                "current_stock",
                "current_inventory_value",
                "updated_at",
            ]
        )

        return InventoryTransaction.objects.create(
            organization=transaction.organization,
            ingredient=ingredient,
            transaction_type=(
                InventoryTransactionType.REVERSAL
            ),
            quantity=-transaction.quantity,
            unit_cost=transaction.unit_cost,
            total_cost=transaction.total_cost,
            purchase_item=transaction.purchase_item,
            order_item_ingredient=(
                transaction.order_item_ingredient
            ),
            reverses=transaction,
            created_by=created_by,
            note=note,
        )


class InventoryAdjustmentService:
    @staticmethod
    @transaction.atomic
    def adjust_stock(
        *,
        organization: Organization,
        ingredient: Ingredient,
        quantity: Decimal,
        unit_cost: Decimal | None = None,
        note: str = "",
    ) -> InventoryTransaction:
        if ingredient.organization_id != organization.id:
            raise ValidationError(
                {
                    "ingredient": (
                        "این ماده اولیه متعلق به "
                        "کسب‌وکار شما نیست."
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

        if quantity == Decimal("0"):
            raise ValidationError(
                {
                    "quantity": (
                        "مقدار اصلاح موجودی نمی‌تواند صفر باشد."
                    )
                }
            )

        ingredient = (
            Ingredient.objects
            .select_for_update()
            .get(pk=ingredient.pk)
        )

        if quantity > Decimal("0"):
            if unit_cost is None:
                raise ValidationError(
                    {
                        "unit_cost": (
                            "برای افزایش موجودی، "
                            "هزینه واحد الزامی است."
                        )
                    }
                )

            if unit_cost < Decimal("0"):
                raise ValidationError(
                    {
                        "unit_cost": (
                            "هزینه واحد نمی‌تواند منفی باشد."
                        )
                    }
                )

            total_cost = quantity * unit_cost

            ingredient.current_stock += quantity
            ingredient.current_inventory_value += total_cost

        else:
            quantity_to_remove = abs(quantity)

            if ingredient.current_stock < quantity_to_remove:
                raise ValidationError(
                    {
                        "quantity": (
                            "موجودی کافی برای اصلاح موجودی وجود ندارد."
                        )
                    }
                )

            effective_unit_cost = (
                ingredient.average_unit_cost
            )

            total_cost = (
                quantity_to_remove
                * effective_unit_cost
            )

            ingredient.current_stock -= quantity_to_remove
            ingredient.current_inventory_value -= total_cost

        ingredient.save(
            update_fields=[
                "current_stock",
                "current_inventory_value",
                "updated_at",
            ]
        )

        return InventoryTransaction.objects.create(
            organization=organization,
            ingredient=ingredient,
            transaction_type=(
                InventoryTransactionType.ADJUSTMENT
            ),
            quantity=quantity,
            unit_cost=(
                unit_cost
                if quantity > Decimal("0")
                else effective_unit_cost
            ),
            total_cost=total_cost,
            note=note,
        )


class InventoryWasteService:
    @staticmethod
    @transaction.atomic
    def record_waste(
        *,
        organization: Organization,
        ingredient: Ingredient,
        quantity: Decimal,
        note: str = "",
    ) -> InventoryTransaction:
        if ingredient.organization_id != organization.id:
            raise ValidationError(
                {
                    "ingredient": (
                        "این ماده اولیه متعلق به "
                        "کسب‌وکار شما نیست."
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

        if quantity <= Decimal("0"):
            raise ValidationError(
                {
                    "quantity": (
                        "مقدار دورریز باید بیشتر از صفر باشد."
                    )
                }
            )

        ingredient = (
            Ingredient.objects
            .select_for_update()
            .get(pk=ingredient.pk)
        )
        print(
    "WASTE STOCK CHECK:",
    "ingredient=", ingredient.name,
    "current_stock=", ingredient.current_stock,
    "quantity=", quantity,
    "base_unit=", ingredient.base_unit,
)

        if ingredient.current_stock < quantity:
            raise ValidationError(
                {
                    "quantity": (
                        "موجودی کافی برای ثبت دورریز وجود ندارد."
                    )
                }
            )

        unit_cost = ingredient.average_unit_cost

        total_cost = quantity * unit_cost

        ingredient.current_stock -= quantity
        ingredient.current_inventory_value -= total_cost

        ingredient.save(
            update_fields=[
                "current_stock",
                "current_inventory_value",
                "updated_at",
            ]
        )

        return InventoryTransaction.objects.create(
            organization=organization,
            ingredient=ingredient,
            transaction_type=(
                InventoryTransactionType.WASTE
            ),
            quantity=-quantity,
            unit_cost=unit_cost,
            total_cost=total_cost,
            note=note,
        )