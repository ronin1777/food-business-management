from decimal import Decimal
from typing import NamedTuple

from django.core.exceptions import ValidationError
from django.db import transaction

from .models import Ingredient


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

        old_stock = ingredient.current_stock
        old_value = ingredient.current_inventory_value

        new_stock = old_stock + quantity
        new_value = old_value + total_cost

        ingredient.current_stock = new_stock
        ingredient.current_inventory_value = new_value

        ingredient.save(
            update_fields=[
                "current_stock",
                "current_inventory_value",
                "updated_at",
            ]
        )

        return (
            new_value / new_stock
            if new_stock > Decimal("0")
            else Decimal("0")
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
        total_cost = quantity * unit_cost

        ingredient.current_stock -= quantity
        ingredient.current_inventory_value -= total_cost

        # Guard against tiny Decimal precision artifacts.
        if ingredient.current_inventory_value < Decimal("0"):
            ingredient.current_inventory_value = Decimal("0")

        ingredient.save(
            update_fields=[
                "current_stock",
                "current_inventory_value",
                "updated_at",
            ]
        )

        return StockDecreaseResult(
            unit_cost=unit_cost,
            total_cost=total_cost,
        )