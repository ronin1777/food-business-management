from decimal import Decimal

from rest_framework import serializers

from apps.inventory.models import Ingredient
from .models import (
    Purchase,
    PurchaseAdditionalCost,
    PurchaseAdditionalCostType,
    PurchaseItem,
    Supplier,
    SupplierPaymentMethod,
    SupplierTransaction,
)


class PurchaseListSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(
        source="supplier.name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Purchase
        fields = (
            "id",
            "supplier",
            "supplier_name",
            "purchased_at",
            "note",
            "created_at",
        )
        read_only_fields = fields


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



class PurchaseItemSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(
        source="ingredient.name",
        read_only=True,
    )

    class Meta:
        model = PurchaseItem
        fields = (
            "id",
            "ingredient",
            "ingredient_name",
            "quantity",
            "unit",
            "base_quantity",
            "unit_price",
            "discount",
            "total_price",
            "created_at",
        )
        read_only_fields = fields


class PurchaseAdditionalCostSerializer(serializers.ModelSerializer):
    cost_type_display = serializers.CharField(
        source="get_cost_type_display",
        read_only=True,
    )

    class Meta:
        model = PurchaseAdditionalCost
        fields = (
            "id",
            "cost_type",
            "cost_type_display",
            "amount",
            "note",
            "created_at",
        )
        read_only_fields = fields


class PurchaseDetailSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(
        source="supplier.name",
        read_only=True,
        allow_null=True,
    )

    items = PurchaseItemSerializer(
        many=True,
        read_only=True,
    )

    additional_costs = PurchaseAdditionalCostSerializer(
        many=True,
        read_only=True,
    )

    items_total = serializers.SerializerMethodField()
    additional_costs_total = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = Purchase
        fields = (
            "id",
            "supplier",
            "supplier_name",
            "organization",
            "purchased_at",
            "note",
            "items",
            "additional_costs",
            "items_total",
            "additional_costs_total",
            "grand_total",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_items_total(self, obj):
        return sum(
            (
                item.total_price
                for item in obj.items.all()
            ),
            Decimal("0"),
        )

    def get_additional_costs_total(self, obj):
        return sum(
            (
                cost.amount
                for cost in obj.additional_costs.all()
            ),
            Decimal("0"),
        )

    def get_grand_total(self, obj):
        return (
            self.get_items_total(obj)
            + self.get_additional_costs_total(obj)
        )


class SupplierListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = (
            "id",
            "name",
            "phone",
            "is_active",
            "created_at",
        )
        read_only_fields = fields


class SupplierDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = (
            "id",
            "name",
            "phone",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields



class SupplierCreateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=150,
    )

    phone = serializers.CharField(
        max_length=30,
        required=False,
        allow_blank=True,
        default="",
    )

    is_active = serializers.BooleanField(
        required=False,
        default=True,
    )


class SupplierUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=150,
        required=False,
    )

    phone = serializers.CharField(
        max_length=30,
        required=False,
        allow_blank=True,
    )

    is_active = serializers.BooleanField(
        required=False,
    )


class SupplierTransactionSerializer(
    serializers.ModelSerializer,
):
    transaction_type_display = serializers.CharField(
        source="get_transaction_type_display",
        read_only=True,
    )

    direction_display = serializers.CharField(
        source="get_direction_display",
        read_only=True,
    )

    class Meta:
        model = SupplierTransaction
        fields = (
            "id",
            "supplier",
            "transaction_type",
            "transaction_type_display",
            "direction",
            "direction_display",
            "amount",
            "purchase",
            "payment",
            "note",
            "created_at",
        )
        read_only_fields = fields




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

        if (
            supplier.organization_id
            != request.user.organization.id
        ):
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

        if (
            purchase.organization_id
            != request.user.organization.id
        ):
            raise serializers.ValidationError(
                "این خرید متعلق به کسب‌وکار شما نیست."
            )

        return purchase

    def validate(self, attrs):
        supplier = attrs["supplier"]
        purchase = attrs.get("purchase")

        if (
            purchase is not None
            and purchase.supplier_id != supplier.id
        ):
            raise serializers.ValidationError(
                {
                    "purchase": (
                        "این خرید متعلق به "
                        "تأمین‌کننده انتخاب‌شده نیست."
                    )
                }
            )

        return attrs



class SupplierRefundCreateSerializer(
    serializers.Serializer,
):
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
    )

    purchase = serializers.PrimaryKeyRelatedField(
        queryset=Purchase.objects.all(),
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

    def validate_supplier(
        self,
        supplier: Supplier,
    ) -> Supplier:
        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if (
            supplier.organization_id
            != request.user.organization.id
        ):
            raise serializers.ValidationError(
                "این تأمین‌کننده متعلق به "
                "کسب‌وکار شما نیست."
            )

        if not supplier.is_active:
            raise serializers.ValidationError(
                "این تأمین‌کننده غیرفعال است."
            )

        return supplier

    def validate_purchase(
        self,
        purchase: Purchase,
    ) -> Purchase:
        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if (
            purchase.organization_id
            != request.user.organization.id
        ):
            raise serializers.ValidationError(
                "این خرید متعلق به "
                "کسب‌وکار شما نیست."
            )

        return purchase

    def validate(self, attrs):
        supplier = attrs["supplier"]
        purchase = attrs["purchase"]

        if purchase.supplier_id != supplier.id:
            raise serializers.ValidationError(
                {
                    "purchase": (
                        "این خرید متعلق به "
                        "تأمین‌کننده انتخاب‌شده نیست."
                    )
                }
            )

        return attrs