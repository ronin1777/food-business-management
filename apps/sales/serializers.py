from decimal import Decimal

from rest_framework import serializers

from .models import (
    Customer,
    CustomerPaymentMethod,
    Order,
)



class CustomerPaymentCreateSerializer(serializers.Serializer):
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
    )

    order = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(),
        required=False,
        allow_null=True,
    )

    amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )

    method = serializers.ChoiceField(
        choices=CustomerPaymentMethod.choices,
    )

    paid_at = serializers.DateTimeField()

    note = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_customer(
        self,
        customer: Customer,
    ) -> Customer:
        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if customer.organization_id != request.user.organization.id:
            raise serializers.ValidationError(
                "این مشتری متعلق به کسب‌وکار شما نیست."
            )

        if not customer.is_active:
            raise serializers.ValidationError(
                "این مشتری غیرفعال است."
            )

        return customer

    def validate_order(
        self,
        order: Order | None,
    ) -> Order | None:
        if order is None:
            return None

        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if order.organization_id != request.user.organization.id:
            raise serializers.ValidationError(
                "این سفارش متعلق به کسب‌وکار شما نیست."
            )

        return order

    def validate(self, attrs):
        customer = attrs["customer"]
        order = attrs.get("order")

        if (
            order is not None
            and order.customer_id != customer.id
        ):
            raise serializers.ValidationError(
                {
                    "order": (
                        "این سفارش متعلق به مشتری انتخاب‌شده نیست."
                    )
                }
            )

        return attrs


class CustomerAccountSerializer(serializers.Serializer):
    customer = serializers.SerializerMethodField()

    debit = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    credit = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    balance = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    direction = serializers.CharField(
        allow_null=True,
    )

    def get_customer(self, obj):
        customer = obj["customer"]

        return {
            "id": customer.id,
            "name": customer.name,
        }