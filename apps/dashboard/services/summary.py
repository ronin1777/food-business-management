from datetime import date
from typing import Any

from apps.reports.services.customers import (
    CustomerReportService,
)
from apps.reports.services.inventory import (
    InventoryReportService,
)
from apps.reports.services.profitability import (
    ProfitabilityReportService,
)
from apps.reports.services.purchases import (
    PurchaseReportService,
)
from apps.reports.services.sales import (
    SalesReportService,
)
from apps.reports.services.suppliers import (
    SupplierReportService,
)
from apps.sales.models import Order

from .insights import DashboardInsightService


class DashboardService:
    @staticmethod
    def get_summary(
        *,
        organization_id: int,
        date_from: date,
        date_to: date,
    ) -> dict[str, Any]:
        # ----------------------------------------------------
        # Reports
        # ----------------------------------------------------

        sales_report = SalesReportService.get_report(
            organization_id=organization_id,
            date_from=date_from,
            date_to=date_to,
        )

        purchase_report = (
            PurchaseReportService.get_report(
                organization_id=organization_id,
                date_from=date_from,
                date_to=date_to,
            )
        )

        profitability_report = (
            ProfitabilityReportService.get_report(
                organization_id=organization_id,
                date_from=date_from,
                date_to=date_to,
            )
        )

        inventory_report = (
            InventoryReportService.get_report(
                organization_id=organization_id,
            )
        )

        customer_report = (
            CustomerReportService.get_report(
                organization_id=organization_id,
            )
        )

        supplier_report = (
            SupplierReportService.get_report(
                organization_id=organization_id,
            )
        )

        # ----------------------------------------------------
        # Recent orders
        # ----------------------------------------------------

        recent_orders = (
            Order.objects
            .filter(
                organization_id=organization_id,
            )
            .select_related("customer")
            .order_by("-ordered_at")[:8]
        )

        # ----------------------------------------------------
        # Summary extraction
        # ----------------------------------------------------

        sales_summary = sales_report["summary"]

        purchase_summary = (
            purchase_report["summary"]
        )

        profitability_summary = (
            profitability_report["summary"]
        )

        inventory_summary = (
            inventory_report["summary"]
        )

        customer_summary = (
            customer_report["summary"]
        )

        supplier_summary = (
            supplier_report["summary"]
        )

        # ----------------------------------------------------
        # Dashboard insights
        # ----------------------------------------------------

        insights = (
            DashboardInsightService.generate_insights(
                sales=sales_summary["total_sales"],
                gross_profit=(
                    profitability_summary[
                        "gross_profit"
                    ]
                ),
                gross_margin=(
                    profitability_summary[
                        "gross_margin"
                    ]
                ),
                inventory=inventory_summary,
                receivables=(
                    customer_summary[
                        "total_receivables"
                    ]
                ),
                payables=(
                    supplier_summary[
                        "total_payables"
                    ]
                ),
            )
        )

        # ----------------------------------------------------
        # Dashboard response
        # ----------------------------------------------------

        return {
            "period": {
                "date_from": date_from,
                "date_to": date_to,
            },

            "kpis": {
                "sales": (
                    sales_summary[
                        "total_sales"
                    ]
                ),

                "purchases": (
                    purchase_summary[
                        "total_purchases"
                    ]
                ),

                "gross_profit": (
                    profitability_summary[
                        "gross_profit"
                    ]
                ),

                "gross_margin": (
                    profitability_summary[
                        "gross_margin"
                    ]
                ),

                "orders": (
                    sales_summary[
                        "order_count"
                    ]
                ),

                "receivables": {
                    "current": (
                        customer_summary[
                            "total_receivables"
                        ]
                    ),
                    "previous": None,
                    "percentage_change": None,
                    "direction": "unchanged",
                },

                "payables": {
                    "current": (
                        supplier_summary[
                            "total_payables"
                        ]
                    ),
                    "previous": None,
                    "percentage_change": None,
                    "direction": "unchanged",
                },

                "inventory_value": {
                    "current": (
                        inventory_summary[
                            "total_inventory_value"
                        ]
                    ),
                },
            },

            "trends": {
                "sales": [
                    {
                        "date": item["date"],
                        "value": item["sales"],
                    }
                    for item in sales_report[
                        "daily_sales"
                    ]
                ],

                "gross_profit": [
                    {
                        "date": item["date"],
                        "value": (
                            item["gross_profit"]
                        ),
                    }
                    for item in profitability_report[
                        "daily_profitability"
                    ]
                ],

                "orders": [
                    {
                        "date": item["date"],
                        "value": (
                            item["order_count"]
                        ),
                    }
                    for item in sales_report[
                        "daily_sales"
                    ]
                ],
            },

            "products": {
                "top_by_sales": (
                    sales_report[
                        "top_products"
                    ]
                ),

                "top_by_profit": (
                    profitability_report[
                        "top_products"
                    ]
                ),
            },

            "inventory": {
                "total_value": (
                    inventory_summary[
                        "total_inventory_value"
                    ]
                ),

                "out_of_stock_count": (
                    inventory_summary[
                        "out_of_stock_count"
                    ]
                ),

                "low_stock_count": (
                    inventory_summary[
                        "low_stock_count"
                    ]
                ),

                "ingredients": (
                    inventory_report[
                        "ingredients"
                    ]
                ),
            },

            "customers": {
                "top_by_sales": (
                    customer_report[
                        "top_customers_by_sales"
                    ]
                ),

                "top_by_balance": (
                    customer_report[
                        "top_customers_by_balance"
                    ]
                ),
            },

            "suppliers": {
                "top_by_purchases": (
                    supplier_report[
                        "top_suppliers_by_purchases"
                    ]
                ),

                "top_by_balance": (
                    supplier_report[
                        "top_suppliers_by_balance"
                    ]
                ),
            },

            "recent_orders": [
                {
                    "id": order.id,
                    "customer_name": (
                        order.customer.name
                        if order.customer
                        else "مشتری ثبت نشده"
                    ),
                    "status": order.status,
                    "payment_status": (
                        order.payment_status
                    ),
                    "ordered_at": order.ordered_at,
                }
                for order in recent_orders
            ],

            "insights": insights,
        }