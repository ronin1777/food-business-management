from decimal import Decimal
from typing import Any

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate

from apps.sales.models import (
    Order,
    OrderItem,
    OrderStatus,
)

from .comparison import ReportComparisonService
from .periods import ReportPeriodService


class ProfitabilityReportService:
    @staticmethod
    def _get_summary(
        *,
        organization_id: int,
        date_from,
        date_to,
    ) -> dict[str, Decimal | int]:
        orders = (
            Order.objects
            .filter(
                organization_id=organization_id,
                ordered_at__date__gte=date_from,
                ordered_at__date__lte=date_to,
                status=OrderStatus.COMPLETED,
            )
        )

        summary = orders.aggregate(
            order_count=Count(
                "id",
                distinct=True,
            ),
            total_sales=Sum(
                "items__total_price",
            ),
            total_material_cost=Sum(
                "items__material_cost",
            ),
        )

        total_sales = (
            summary["total_sales"]
            or Decimal("0")
        )

        total_material_cost = (
            summary["total_material_cost"]
            or Decimal("0")
        )

        order_count = (
            summary["order_count"]
            or 0
        )

        gross_profit = (
            total_sales - total_material_cost
        )

        gross_margin = (
            (
                gross_profit
                / total_sales
            ) * Decimal("100")
            if total_sales > Decimal("0")
            else Decimal("0")
        )

        average_order_value = (
            total_sales / order_count
            if order_count > 0
            else Decimal("0")
        )

        return {
            "total_sales": total_sales,
            "total_material_cost": (
                total_material_cost
            ),
            "gross_profit": gross_profit,
            "gross_margin": gross_margin,
            "order_count": order_count,
            "average_order_value": (
                average_order_value
            ),
        }

    @staticmethod
    def get_report(
        *,
        organization_id: int,
        date_from,
        date_to,
    ) -> dict[str, Any]:
        ReportPeriodService.validate_period(
            date_from=date_from,
            date_to=date_to,
        )

        periods = ReportPeriodService.get_periods(
            date_from=date_from,
            date_to=date_to,
        )

        current_from = periods["current"]["date_from"]
        current_to = periods["current"]["date_to"]

        previous_from = periods["previous"]["date_from"]
        previous_to = periods["previous"]["date_to"]

        current_summary = (
            ProfitabilityReportService._get_summary(
                organization_id=organization_id,
                date_from=current_from,
                date_to=current_to,
            )
        )

        previous_summary = (
            ProfitabilityReportService._get_summary(
                organization_id=organization_id,
                date_from=previous_from,
                date_to=previous_to,
            )
        )

        comparison = (
            ReportComparisonService.compare_metrics(
                current=current_summary,
                previous=previous_summary,
            )
        )

        current_orders = (
            Order.objects
            .filter(
                organization_id=organization_id,
                ordered_at__date__gte=current_from,
                ordered_at__date__lte=current_to,
                status=OrderStatus.COMPLETED,
            )
        )

        daily_profitability = (
            current_orders
            .annotate(
                date=TruncDate("ordered_at"),
            )
            .values("date")
            .annotate(
                sales=Sum(
                    "items__total_price",
                ),
                material_cost=Sum(
                    "items__material_cost",
                ),
                order_count=Count(
                    "id",
                    distinct=True,
                ),
            )
            .order_by("date")
        )

        daily_profitability = [
            {
                "date": row["date"],
                "sales": (
                    row["sales"]
                    or Decimal("0")
                ),
                "material_cost": (
                    row["material_cost"]
                    or Decimal("0")
                ),
                "gross_profit": (
                    (
                        row["sales"]
                        or Decimal("0")
                    )
                    - (
                        row["material_cost"]
                        or Decimal("0")
                    )
                ),
                "order_count": row["order_count"],
            }
            for row in daily_profitability
        ]

        top_products = (
            OrderItem.objects
            .filter(
                order__organization_id=organization_id,
                order__ordered_at__date__gte=current_from,
                order__ordered_at__date__lte=current_to,
                order__status=OrderStatus.COMPLETED,
            )
            .values(
                "product_id",
                "product__name",
            )
            .annotate(
                quantity_sold=Sum(
                    "quantity",
                ),
                sales=Sum(
                    "total_price",
                ),
                material_cost=Sum(
                    "material_cost",
                ),
            )
            .order_by("-sales")[:10]
        )

        top_products = [
            {
                "product_id": row["product_id"],
                "product_name": row["product__name"],
                "quantity_sold": (
                    row["quantity_sold"]
                    or Decimal("0")
                ),
                "sales": (
                    row["sales"]
                    or Decimal("0")
                ),
                "material_cost": (
                    row["material_cost"]
                    or Decimal("0")
                ),
                "gross_profit": (
                    (
                        row["sales"]
                        or Decimal("0")
                    )
                    - (
                        row["material_cost"]
                        or Decimal("0")
                    )
                ),
                "gross_margin": (
                    (
                        (
                            row["sales"]
                            or Decimal("0")
                        )
                        - (
                            row["material_cost"]
                            or Decimal("0")
                        )
                    )
                    / row["sales"]
                    * Decimal("100")
                    if (
                        row["sales"]
                        and row["sales"] > Decimal("0")
                    )
                    else Decimal("0")
                ),
            }
            for row in top_products
        ]

        return {
            "period": periods,
            "summary": {
                "total_sales": comparison[
                    "total_sales"
                ],
                "total_material_cost": comparison[
                    "total_material_cost"
                ],
                "gross_profit": comparison[
                    "gross_profit"
                ],
                "gross_margin": comparison[
                    "gross_margin"
                ],
                "order_count": comparison[
                    "order_count"
                ],
                "average_order_value": comparison[
                    "average_order_value"
                ],
            },
            "daily_profitability": (
                daily_profitability
            ),
            "top_products": top_products,
        }