from decimal import Decimal
from typing import Any

from django.db.models import Count, F, Sum

from apps.inventory.models import Ingredient


class InventoryReportService:
    @staticmethod
    def get_report(
        *,
        organization_id: int,
    ) -> dict[str, Any]:
        ingredients = (
            Ingredient.objects
            .filter(
                organization_id=organization_id,
            )
            .order_by("name")
        )

        summary = ingredients.aggregate(
            ingredient_count=Count("id"),
            total_inventory_value=Sum(
                "current_inventory_value",
            ),
        )

        ingredient_count = (
            summary["ingredient_count"]
            or 0
        )

        total_inventory_value = (
            summary["total_inventory_value"]
            or Decimal("0")
        )

        out_of_stock_count = ingredients.filter(
            current_stock=Decimal("0"),
        ).count()

        low_stock_count = ingredients.filter(
            current_stock__gt=Decimal("0"),
            current_stock__lte=F("minimum_stock"),
            minimum_stock__gt=Decimal("0"),
        ).count()

        inventory_by_unit_type = (
            ingredients
            .values(
                "unit_type",
            )
            .annotate(
                ingredient_count=Count("id"),
                inventory_value=Sum(
                    "current_inventory_value",
                ),
                stock=Sum("current_stock"),
            )
            .order_by("unit_type")
        )

        ingredient_details = []

        for ingredient in ingredients:
            current_stock = ingredient.current_stock
            minimum_stock = ingredient.minimum_stock

            is_out_of_stock = (
                current_stock == Decimal("0")
            )

            is_low_stock = (
                not is_out_of_stock
                and minimum_stock > Decimal("0")
                and current_stock <= minimum_stock
            )

            ingredient_details.append(
                {
                    "id": ingredient.id,
                    "name": ingredient.name,
                    "unit_type": ingredient.unit_type,
                    "base_unit": ingredient.base_unit,
                    "current_stock": current_stock,
                    "minimum_stock": minimum_stock,
                    "current_inventory_value": (
                        ingredient.current_inventory_value
                    ),
                    "average_unit_cost": (
                        ingredient.average_unit_cost
                    ),
                    "is_active": ingredient.is_active,
                    "is_out_of_stock": is_out_of_stock,
                    "is_low_stock": is_low_stock,
                }
            )

        return {
            "summary": {
                "ingredient_count": ingredient_count,
                "total_inventory_value": (
                    total_inventory_value
                ),
                "out_of_stock_count": (
                    out_of_stock_count
                ),
                "low_stock_count": low_stock_count,
            },
            "by_unit_type": list(
                inventory_by_unit_type
            ),
            "ingredients": ingredient_details,
        }