from decimal import Decimal
from typing import Any

from django.db.models import F, Sum

from apps.purchases.models import (
    AccountDirection,
    Supplier,
    SupplierTransaction,
    SupplierTransactionType,
)


class SupplierReportService:
    @staticmethod
    def get_report(
        *,
        organization_id: int,
    ) -> dict[str, Any]:
        suppliers = Supplier.objects.filter(
            organization_id=organization_id,
        )

        total_suppliers = suppliers.count()

        active_suppliers = suppliers.filter(
            is_active=True,
        ).count()

        supplier_transactions = (
            SupplierTransaction.objects
            .filter(
                organization_id=organization_id,
            )
        )

        debit_total = (
            supplier_transactions
            .filter(
                direction=AccountDirection.DEBIT,
            )
            .aggregate(
                total=Sum("amount"),
            )
            .get("total")
            or Decimal("0")
        )

        credit_total = (
            supplier_transactions
            .filter(
                direction=AccountDirection.CREDIT,
            )
            .aggregate(
                total=Sum("amount"),
            )
            .get("total")
            or Decimal("0")
        )

        total_payables = (
            credit_total - debit_total
        )

        if total_payables < Decimal("0"):
            total_payables = Decimal("0")

        suppliers_with_payable = 0

        supplier_balances = []

        for supplier in suppliers:
            transactions = (
                supplier_transactions.filter(
                    supplier=supplier,
                )
            )

            debit = (
                transactions
                .filter(
                    direction=AccountDirection.DEBIT,
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
                    direction=AccountDirection.CREDIT,
                )
                .aggregate(
                    total=Sum("amount"),
                )
                .get("total")
                or Decimal("0")
            )

            balance = credit - debit

            if balance > Decimal("0"):
                suppliers_with_payable += 1

                supplier_balances.append(
                    {
                        "supplier_id": supplier.id,
                        "supplier_name": supplier.name,
                        "balance": balance,
                    }
                )

        supplier_balances.sort(
            key=lambda item: item["balance"],
            reverse=True,
        )

        top_suppliers_by_balance = (
            supplier_balances[:10]
        )

        top_suppliers_by_purchases = (
            SupplierTransaction.objects
            .filter(
                organization_id=organization_id,
                transaction_type=(
                    SupplierTransactionType.PURCHASE
                ),
                direction=AccountDirection.CREDIT,
            )
            .values(
                "supplier_id",
                supplier_name=F(
                    "supplier__name",
                ),
            )
            .annotate(
                total_purchases=Sum("amount"),
            )
            .order_by("-total_purchases")[:10]
        )

        return {
            "summary": {
                "total_suppliers": total_suppliers,
                "active_suppliers": active_suppliers,
                "suppliers_with_payable": (
                    suppliers_with_payable
                ),
                "total_payables": total_payables,
            },
            "top_suppliers_by_purchases": list(
                top_suppliers_by_purchases
            ),
            "top_suppliers_by_balance": (
                top_suppliers_by_balance
            ),
        }