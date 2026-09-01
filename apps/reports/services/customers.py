from decimal import Decimal
from typing import Any

from django.db.models import (
    Count,
    F,
    Sum,
)

from apps.sales.models import (
    Customer,
    CustomerAccountDirection,
    CustomerTransaction,
    CustomerTransactionType,
)


class CustomerReportService:
    @staticmethod
    def get_report(
        *,
        organization_id: int,
    ) -> dict[str, Any]:
        customers = (
            Customer.objects
            .filter(
                organization_id=organization_id,
            )
        )

        total_customers = customers.count()

        active_customers = customers.filter(
            is_active=True,
        ).count()

        # ----------------------------------------------------
        # Customer balances from ledger
        # ----------------------------------------------------

        customer_transactions = (
            CustomerTransaction.objects
            .filter(
                organization_id=organization_id,
            )
        )

        debit_total = (
            customer_transactions
            .filter(
                direction=(
                    CustomerAccountDirection.DEBIT
                ),
            )
            .aggregate(
                total=Sum("amount"),
            )
            .get("total")
            or Decimal("0")
        )

        credit_total = (
            customer_transactions
            .filter(
                direction=(
                    CustomerAccountDirection.CREDIT
                ),
            )
            .aggregate(
                total=Sum("amount"),
            )
            .get("total")
            or Decimal("0")
        )

        total_receivables = (
            debit_total - credit_total
        )

        if total_receivables < Decimal("0"):
            total_receivables = Decimal("0")

        # ----------------------------------------------------
        # Customers with outstanding receivable
        # ----------------------------------------------------

        customers_with_receivable = 0

        customer_balances = []

        for customer in customers:
            transactions = customer_transactions.filter(
                customer=customer,
            )

            debit = (
                transactions
                .filter(
                    direction=(
                        CustomerAccountDirection.DEBIT
                    ),
                )
                .aggregate(
                    total=Sum("amount"),
                )
                .get("total")
                or Decimal("0")
            )

            credit = (
                transactions
                .filter(
                    direction=(
                        CustomerAccountDirection.CREDIT
                    ),
                )
                .aggregate(
                    total=Sum("amount"),
                )
                .get("total")
                or Decimal("0")
            )

            balance = debit - credit

            if balance > Decimal("0"):
                customers_with_receivable += 1

                customer_balances.append(
                    {
                        "customer_id": customer.id,
                        "customer_name": customer.name,
                        "balance": balance,
                    }
                )

        customer_balances.sort(
            key=lambda item: item["balance"],
            reverse=True,
        )

        top_customers_by_balance = (
            customer_balances[:10]
        )

        # ----------------------------------------------------
        # Top customers by sales
        # ----------------------------------------------------

        top_customers_by_sales = (
            CustomerTransaction.objects
            .filter(
                organization_id=organization_id,
                transaction_type=(
                    CustomerTransactionType.SALE
                ),
                direction=(
                    CustomerAccountDirection.DEBIT
                ),
            )
            .values(
                "customer_id",
                customer_name=F(
                    "customer__name"
                ),
            )
            .annotate(
                total_sales=Sum("amount"),
            )
            .order_by("-total_sales")[:10]
        )

        return {
            "summary": {
                "total_customers": total_customers,
                "active_customers": active_customers,
                "customers_with_receivable": (
                    customers_with_receivable
                ),
                "total_receivables": (
                    total_receivables
                ),
            },
            "top_customers_by_sales": list(
                top_customers_by_sales
            ),
            "top_customers_by_balance": (
                top_customers_by_balance
            ),
        }