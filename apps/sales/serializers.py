from decimal import Decimal
from apps.products.models import Product

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



class OrderItemCreateSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
    )

    quantity = serializers.IntegerField(
        min_value=1,
    )

    def validate_product(self, product: Product) -> Product:
        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if product.organization_id != request.user.organization.id:
            raise serializers.ValidationError(
                "این محصول متعلق به کسب‌وکار شما نیست."
            )

        if not product.is_active:
            raise serializers.ValidationError(
                "این محصول غیرفعال است."
            )

        return product


class OrderCreateSerializer(serializers.Serializer):
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        required=False,
        allow_null=True,
    )

    ordered_at = serializers.DateTimeField()

    items = OrderItemCreateSerializer(
        many=True,
        allow_empty=False,
    )

    note = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_customer(
        self,
        customer: Customer | None,
    ) -> Customer | None:
        if customer is None:
            return None

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