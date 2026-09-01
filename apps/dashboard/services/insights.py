from decimal import Decimal
from typing import Any


class DashboardInsightService:
    @staticmethod
    def generate_insights(
        *,
        sales: dict[str, Any],
        gross_profit: dict[str, Any],
        gross_margin: dict[str, Any],
        inventory: dict[str, Any],
        receivables: Decimal,
        payables: Decimal,
    ) -> list[dict[str, Any]]:
        insights: list[dict[str, Any]] = []

        # ----------------------------------------------------
        # Sales growth
        # ----------------------------------------------------

        sales_change = sales.get(
            "percentage_change"
        )

        if (
            sales_change is not None
            and sales_change >= Decimal("10")
        ):
            insights.append(
                {
                    "type": "sales_growth",
                    "severity": "positive",
                    "title": "رشد فروش",
                    "message": (
                        f"فروش نسبت به دوره قبل "
                        f"{sales_change:.2f}% افزایش داشته است."
                    ),
                    "metric": "sales",
                }
            )

        elif (
            sales_change is not None
            and sales_change <= Decimal("-10")
        ):
            insights.append(
                {
                    "type": "sales_decline",
                    "severity": "warning",
                    "title": "کاهش فروش",
                    "message": (
                        f"فروش نسبت به دوره قبل "
                        f"{abs(sales_change):.2f}% کاهش داشته است."
                    ),
                    "metric": "sales",
                }
            )

        # ----------------------------------------------------
        # Gross profit
        # ----------------------------------------------------

        gross_profit_change = gross_profit.get(
            "percentage_change"
        )

        if (
            gross_profit_change is not None
            and gross_profit_change < Decimal("0")
        ):
            insights.append(
                {
                    "type": "profit_decline",
                    "severity": "warning",
                    "title": "کاهش سود ناخالص",
                    "message": (
                        "سود ناخالص نسبت به دوره قبل "
                        f"{abs(gross_profit_change):.2f}% "
                        "کاهش داشته است."
                    ),
                    "metric": "gross_profit",
                }
            )

        # ----------------------------------------------------
        # Gross margin
        # ----------------------------------------------------

        gross_margin_change = gross_margin.get(
            "percentage_change"
        )

        if (
            gross_margin_change is not None
            and gross_margin_change <= Decimal("-5")
        ):
            insights.append(
                {
                    "type": "margin_decline",
                    "severity": "warning",
                    "title": "کاهش حاشیه سود",
                    "message": (
                        "حاشیه سود نسبت به دوره قبل "
                        f"{abs(gross_margin_change):.2f}% "
                        "کاهش داشته است."
                    ),
                    "metric": "gross_margin",
                }
            )

        # ----------------------------------------------------
        # Inventory
        # ----------------------------------------------------

        out_of_stock_count = inventory.get(
            "out_of_stock_count",
            0,
        )

        if out_of_stock_count > 0:
            insights.append(
                {
                    "type": "out_of_stock",
                    "severity": "critical",
                    "title": "موجودی تمام شده",
                    "message": (
                        f"{out_of_stock_count} ماده اولیه "
                        "موجودی ندارد."
                    ),
                    "metric": "inventory",
                }
            )

        # ----------------------------------------------------
        # Receivables
        # ----------------------------------------------------

        if receivables > Decimal("0"):
            insights.append(
                {
                    "type": "receivables",
                    "severity": "info",
                    "title": "مطالبات مشتریان",
                    "message": (
                        f"مبلغ {receivables:,.0f} "
                        "از مشتریان قابل وصول است."
                    ),
                    "metric": "receivables",
                }
            )

        # ----------------------------------------------------
        # Payables
        # ----------------------------------------------------

        if payables > Decimal("0"):
            insights.append(
                {
                    "type": "payables",
                    "severity": "info",
                    "title": "بدهی تأمین‌کنندگان",
                    "message": (
                        f"مبلغ {payables:,.0f} "
                        "به تأمین‌کنندگان بدهکار هستید."
                    ),
                    "metric": "payables",
                }
            )

        return insights