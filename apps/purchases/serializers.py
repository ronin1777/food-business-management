from decimal import Decimal

from rest_framework import serializers

from apps.inventory.models import Ingredient
from .models import (
    Purchase,
    PurchaseAdditionalCostType,
    Supplier,
    SupplierPaymentMethod,
)

class PurchaseItemInputSerializer(serializers.Serializer):
    ingredient = serializers.PrimaryKeyRelatedField(
        queryset=Ingredient.objects.all(),
    )

    quantity = serializers.DecimalField(
        max_digits=14,
        decimal_places=3,
        min_value=Decimal("0.001"),
    )

    unit = serializers.CharField(
        max_length=10,
    )

    unit_price = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0"),
    )

    discount = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0"),
        required=False,
        default=Decimal("0"),
    )

    def validate_ingredient(self, ingredient: Ingredient) -> Ingredient:
        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if ingredient.organization_id != request.user.organization.id:
            raise serializers.ValidationError(
                "این ماده اولیه متعلق به کسب‌وکار شما نیست."
            )

        if not ingredient.is_active:
            raise serializers.ValidationError(
                "این ماده اولیه غیرفعال است."
            )

        return ingredient


class PurchaseAdditionalCostInputSerializer(serializers.Serializer):
    cost_type = serializers.ChoiceField(
        choices=PurchaseAdditionalCostType.choices,
    )

    amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )

    note = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )


class PurchaseCreateSerializer(serializers.Serializer):
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        required=False,
        allow_null=True,
    )

    purchased_at = serializers.DateTimeField()

    items = PurchaseItemInputSerializer(
        many=True,
        allow_empty=False,
    )

    additional_costs = PurchaseAdditionalCostInputSerializer(
        many=True,
        required=False,
        default=list,
    )

    note = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_supplier(
        self,
        supplier: Supplier | None,
    ) -> Supplier | None:
        if supplier is None:
            return None

        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if supplier.organization_id != request.user.organization.id:
            raise serializers.ValidationError(
                "این تأمین‌کننده متعلق به کسب‌وکار شما نیست."
            )

        if not supplier.is_active:
            raise serializers.ValidationError(
                "این تأمین‌کننده غیرفعال است."
            )

        return supplier


class SupplierPaymentCreateSerializer(serializers.Serializer):
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
    )

    purchase = serializers.PrimaryKeyRelatedField(
        queryset=Purchase.objects.all(),
        required=False,
        allow_null=True,
    )

    amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )

    method = serializers.ChoiceField(
        choices=SupplierPaymentMethod.choices,
    )

    paid_at = serializers.DateTimeField()

    note = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_supplier(
        self,
        supplier: Supplier,
    ) -> Supplier:
        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if supplier.organization_id != request.user.organization.id:
            raise serializers.ValidationError(
                "این تأمین‌کننده متعلق به کسب‌وکار شما نیست."
            )

        if not supplier.is_active:
            raise serializers.ValidationError(
                "این تأمین‌کننده غیرفعال است."
            )

        return supplier

    def validate_purchase(
        self,
        purchase: Purchase | None,
    ) -> Purchase | None:
        if purchase is None:
            return None

        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if purchase.organization_id != request.user.organization.id:
            raise serializers.ValidationError(
                "این خرید متعلق به کسب‌وکار شما نیست."
            )

        return purchase



class SupplierAccountSerializer(serializers.Serializer):
    supplier = serializers.SerializerMethodField()

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

    def get_supplier(self, obj):
        supplier = obj["supplier"]

        return {
            "id": supplier.id,
            "name": supplier.name,
        }