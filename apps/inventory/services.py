from decimal import Decimal, ROUND_HALF_UP
from typing import NamedTuple

from django.core.exceptions import ValidationError
from django.db import transaction

from .models import Ingredient


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


