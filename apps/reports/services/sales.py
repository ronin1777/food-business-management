from decimal import Decimal
from typing import Any

from django.db.models import (
    Count,
    F,
    Sum,
)
from django.db.models.functions import TruncDate

from apps.sales.models import (
    Order,
    OrderItem,
    OrderStatus,
)

from .comparison import ReportComparisonService
from .periods import ReportPeriodService


class SalesReportService:
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
        )

        total_sales = (
            summary["total_sales"]
            or Decimal("0")
        )

        order_count = (
            summary["order_count"]
            or 0
        )

        average_order_value = (
            total_sales / order_count
            if order_count > 0
            else Decimal("0")
        )

        return {
            "total_sales": total_sales,
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
            SalesReportService._get_summary(
                organization_id=organization_id,
                date_from=current_from,
                date_to=current_to,
            )
        )

        previous_summary = (
            SalesReportService._get_summary(
                organization_id=organization_id,
                date_from=previous_from,
                date_to=previous_to,
            )
        )

        comparison = ReportComparisonService.compare_metrics(
            current=current_summary,
            previous=previous_summary,
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

        daily_sales = (
            current_orders
            .annotate(
                date=TruncDate("ordered_at"),
            )
            .values("date")
            .annotate(
                sales=Sum(
                    "items__total_price",
                ),
                order_count=Count(
                    "id",
                    distinct=True,
                ),
            )
            .order_by("date")
        )

        top_products = (
            OrderItem.objects
            .filter(
                order__organization_id=organization_id,
                order__ordered_at__date__gte=current_from,
                order__ordered_at__date__lte=current_to,
                order__status=OrderStatus.COMPLETED,
            )
            .values(
                product_id=F("product_id"),
                product_name=F("product__name"),
            )
            .annotate(
                quantity_sold=Sum("quantity"),
                sales=Sum("total_price"),
            )
            .order_by("-sales")[:10]
        )

        return {
            "period": periods,
            "summary": {
                "total_sales": comparison["total_sales"],
                "order_count": comparison["order_count"],
                "average_order_value": comparison[
                    "average_order_value"
                ],
            },
            "daily_sales": list(
                daily_sales
            ),
            "top_products": list(
                top_products
            ),
        }