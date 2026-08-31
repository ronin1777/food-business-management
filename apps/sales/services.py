from decimal import Decimal
from typing import Any
from django.db.models import Sum

from django.core.exceptions import ValidationError
from django.db import transaction

from apps.organizations.models import Organization

from .models import (
    Customer,
    CustomerPayment,
    CustomerPaymentMethod,
    CustomerTransaction,
    CustomerTransactionType,
    CustomerAccountDirection,
    Order,
)


class CustomerPaymentService:
    @staticmethod
    @transaction.atomic
    def create_payment(
        *,
        organization: Organization,
        customer: Customer,
        amount: Decimal,
        method: str,
        paid_at: Any,
        order: Order | None = None,
        note: str = "",
    ) -> CustomerPayment:

        if customer.organization_id != organization.id:
            raise ValidationError(
                {
                    "customer": (
                        "این مشتری متعلق به کسب‌وکار شما نیست."
                    )
                }
            )

        if not customer.is_active:
            raise ValidationError(
                {
                    "customer": "این مشتری غیرفعال است."
                }
            )

        if amount <= Decimal("0"):
            raise ValidationError(
                {
                    "amount": (
                        "مبلغ پرداخت باید بیشتر از صفر باشد."
                    )
                }
            )

        if order is not None:
            if order.organization_id != organization.id:
                raise ValidationError(
                    {
                        "order": (
                            "این سفارش متعلق به کسب‌وکار شما نیست."
                        )
                    }
                )

            if order.customer_id != customer.id:
                raise ValidationError(
                    {
                        "order": (
                            "این سفارش متعلق به این مشتری نیست."
                        )
                    }
                )

        payment = CustomerPayment.objects.create(
            organization=organization,
            customer=customer,
            order=order,
            amount=amount,
            method=method,
            paid_at=paid_at,
            note=note,
        )

        CustomerTransaction.objects.create(
            organization=organization,
            customer=customer,
            transaction_type=CustomerTransactionType.PAYMENT,
            direction=CustomerAccountDirection.CREDIT,
            amount=amount,
            order=order,
            payment=payment,
            note=note,
        )

        return payment



class CustomerAccountService:
    @staticmethod
    def get_account(
        *,
        organization: Organization,
        customer: Customer,
    ) -> dict[str, Any]:
        if customer.organization_id != organization.id:
            raise ValidationError(
                {
                    "customer": (
                        "این مشتری متعلق به کسب‌وکار شما نیست."
                    )
                }
            )

        transactions = CustomerTransaction.objects.filter(
            organization=organization,
            customer=customer,
        )

        debit = (
            transactions
            .filter(
                direction=CustomerAccountDirection.DEBIT,
            )
            .aggregate(total=Sum("amount"))
            .get("total")
            or Decimal("0")
        )

        credit = (
            transactions
            .filter(
                direction=CustomerAccountDirection.CREDIT,
            )
            .aggregate(total=Sum("amount"))
            .get("total")
            or Decimal("0")
        )

        if debit > credit:
            balance = debit - credit
            direction = CustomerAccountDirection.DEBIT

        elif credit > debit:
            balance = credit - debit
            direction = CustomerAccountDirection.CREDIT

        else:
            balance = Decimal("0")
            direction = None

        return {
            "customer": customer,
            "debit": debit,
            "credit": credit,
            "balance": balance,
            "direction": direction,
        }