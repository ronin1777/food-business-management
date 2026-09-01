from decimal import Decimal
from typing import Any

from django.db.models import (
    Count,
    F,
    Sum,
)
from django.db.models.functions import TruncDate

from apps.purchases.models import (
    Purchase,
    PurchaseItem,
    PurchaseStatus,
)

from .comparison import ReportComparisonService
from .periods import ReportPeriodService


class PurchaseReportService:
    @staticmethod
    def _get_summary(
        *,
        organization_id: int,
        date_from,
        date_to,
    ) -> dict[str, Decimal | int]:
        purchases = (
            Purchase.objects
            .filter(
                organization_id=organization_id,
                purchased_at__date__gte=date_from,
                purchased_at__date__lte=date_to,
                status=PurchaseStatus.COMPLETED,
            )
        )

        summary = purchases.aggregate(
            purchase_count=Count(
                "id",
                distinct=True,
            ),
            total_purchases=Sum(
                "items__total_price",
            ),
        )

        total_purchases = (
            summary["total_purchases"]
            or Decimal("0")
        )

        purchase_count = (
            summary["purchase_count"]
            or 0
        )

        average_purchase_value = (
            total_purchases / purchase_count
            if purchase_count > 0
            else Decimal("0")
        )

        return {
            "total_purchases": total_purchases,
            "purchase_count": purchase_count,
            "average_purchase_value": (
                average_purchase_value
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
            PurchaseReportService._get_summary(
                organization_id=organization_id,
                date_from=current_from,
                date_to=current_to,
            )
        )

        previous_summary = (
            PurchaseReportService._get_summary(
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

        current_purchases = (
            Purchase.objects
            .filter(
                organization_id=organization_id,
                purchased_at__date__gte=current_from,
                purchased_at__date__lte=current_to,
                status=PurchaseStatus.COMPLETED,
            )
        )

        daily_purchases = (
            current_purchases
            .annotate(
                date=TruncDate("purchased_at"),
            )
            .values("date")
            .annotate(
                purchases=Sum(
                    "items__total_price",
                ),
                purchase_count=Count(
                    "id",
                    distinct=True,
                ),
            )
            .order_by("date")
        )

        top_ingredients = (
            PurchaseItem.objects
            .filter(
                purchase__organization_id=organization_id,
                purchase__purchased_at__date__gte=current_from,
                purchase__purchased_at__date__lte=current_to,
                purchase__status=PurchaseStatus.COMPLETED,
            )
            .values(
    "ingredient_id",
    ingredient_name=F(
        "ingredient__name",
    ),
)
            .annotate(
                quantity_purchased=Sum(
                    "base_quantity",
                ),
                purchases=Sum(
                    "total_price",
                ),
            )
            .order_by("-purchases")[:10]
        )

        return {
            "period": periods,

            "summary": {
                "total_purchases": comparison[
                    "total_purchases"
                ],
                "purchase_count": comparison[
                    "purchase_count"
                ],
                "average_purchase_value": comparison[
                    "average_purchase_value"
                ],
            },

            "daily_purchases": list(
                daily_purchases
            ),

            "top_ingredients": list(
                top_ingredients
            ),
        }