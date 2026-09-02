from decimal import Decimal

from rest_framework import serializers

from apps.products.models import Product
from django.db.models import Sum
from .models import (
    Customer,
    CustomerPayment,
    CustomerPaymentMethod,
    CustomerTransaction,
    Order,
    OrderItem,
    OrderItemIngredient,
)


# ============================================================
# Customer Payment
# ============================================================


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

        if (
            customer.organization_id
            != request.user.organization.id
        ):
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

        if (
            order.organization_id
            != request.user.organization.id
        ):
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
                        "این سفارش متعلق به "
                        "مشتری انتخاب‌شده نیست."
                    )
                }
            )

        return attrs


# ============================================================
# Customer Account
# ============================================================


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


# ============================================================
# Order Create
# ============================================================


class OrderItemCreateSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
    )

    quantity = serializers.IntegerField(
        min_value=1,
    )

    def validate_product(
        self,
        product: Product,
    ) -> Product:
        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if (
            product.organization_id
            != request.user.organization.id
        ):
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

        if (
            customer.organization_id
            != request.user.organization.id
        ):
            raise serializers.ValidationError(
                "این مشتری متعلق به کسب‌وکار شما نیست."
            )

        if not customer.is_active:
            raise serializers.ValidationError(
                "این مشتری غیرفعال است."
            )

        return customer


# ============================================================
# Customer CRUD
# ============================================================


class CustomerCreateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=150,
    )

    phone = serializers.CharField(
        max_length=30,
        required=False,
        allow_blank=True,
        default="",
    )

    note = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    is_active = serializers.BooleanField(
        required=False,
        default=True,
    )


class CustomerUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=150,
        required=False,
    )

    phone = serializers.CharField(
        max_length=30,
        required=False,
        allow_blank=True,
    )

    note = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    is_active = serializers.BooleanField(
        required=False,
    )


class CustomerListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = (
            "id",
            "name",
            "phone",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class CustomerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = (
            "id",
            "name",
            "phone",
            "note",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


# ============================================================
# Order Item Output
# ============================================================


class OrderItemListSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "quantity",
            "unit_price",
            "total_price",
            "material_cost",
        )
        read_only_fields = fields


class OrderItemIngredientSerializer(
    serializers.ModelSerializer,
):
    ingredient_name = serializers.CharField(
        source="ingredient.name",
        read_only=True,
    )

    class Meta:
        model = OrderItemIngredient
        fields = (
            "id",
            "ingredient",
            "ingredient_name",
            "quantity",
            "unit_cost",
            "total_cost",
        )
        read_only_fields = fields


class OrderItemDetailSerializer(
    serializers.ModelSerializer,
):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    recipe_version = serializers.IntegerField(
        source="recipe.version",
        read_only=True,
    )

    ingredient_usages = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "recipe",
            "recipe_version",
            "quantity",
            "unit_price",
            "total_price",
            "material_cost",
            "ingredient_usages",
            "created_at",
        )
        read_only_fields = fields

    def get_ingredient_usages(self, obj):
        usages = (
            OrderItemIngredient.objects
            .filter(order_item=obj)
            .select_related("ingredient")
        )

        return OrderItemIngredientSerializer(
            usages,
            many=True,
        ).data


# ============================================================
# Order Output
# ============================================================


class OrderListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source="customer.name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Order
        fields = (
            "id",
            "customer",
            "customer_name",
            "status",
            "payment_status",
            "ordered_at",
            "created_at",
        )
        read_only_fields = fields


class OrderDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source="customer.name",
        read_only=True,
        allow_null=True,
    )

    items = OrderItemDetailSerializer(
        many=True,
        read_only=True,
    )

    total_amount = serializers.SerializerMethodField()

    total_material_cost = (
        serializers.SerializerMethodField()
    )

    gross_profit = serializers.SerializerMethodField()

    paid_amount = serializers.SerializerMethodField()

    remaining_amount = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "customer",
            "customer_name",
            "status",
            "payment_status",
            "ordered_at",
            "note",
            "items",
            "total_amount",
            "total_material_cost",
            "gross_profit",
            "created_at",
            "updated_at", "remaining_amount", "paid_amount",

        )
        read_only_fields = fields


    def get_paid_amount(self, obj):
        return ( CustomerPayment.objects
            .filter(order=obj)
            .aggregate(
                total=Sum("amount")
        )
        .get("total")
        or Decimal("0")
    )


    def get_remaining_amount(self, obj):
        total_amount = self.get_total_amount(obj)

        paid_amount = self.get_paid_amount(obj)

        remaining_amount = (
            total_amount - paid_amount
        )

        return max(
            remaining_amount,
            Decimal("0"),
    )


    def get_total_amount(self, obj):
        return sum(
            (
                item.total_price
                for item in obj.items.all()
            ),
            Decimal("0"),
        )

    def get_total_material_cost(self, obj):
        return sum(
            (
                item.material_cost
                for item in obj.items.all()
            ),
            Decimal("0"),
        )

    def get_gross_profit(self, obj):
        total_amount = self.get_total_amount(obj)

        total_material_cost = (
            self.get_total_material_cost(obj)
        )

        return (
            total_amount
            - total_material_cost
        )


class CustomerTransactionSerializer(
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
        model = CustomerTransaction
        fields = (
            "id",
            "transaction_type",
            "transaction_type_display",
            "direction",
            "direction_display",
            "amount",
            "order",
            "payment",
            "note",
            "created_at",
        )
        read_only_fields = fields



class CustomerRefundCreateSerializer(serializers.Serializer):
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
    )

    order = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(),
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

    def validate_customer(
        self,
        customer: Customer,
    ) -> Customer:
        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if (
            customer.organization_id
            != request.user.organization.id
        ):
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
        order: Order,
    ) -> Order:
        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError(
                "درخواست معتبر نیست."
            )

        if (
            order.organization_id
            != request.user.organization.id
        ):
            raise serializers.ValidationError(
                "این سفارش متعلق به کسب‌وکار شما نیست."
            )

        return order

    def validate(self, attrs):
        customer = attrs["customer"]
        order = attrs["order"]

        if order.customer_id != customer.id:
            raise serializers.ValidationError(
                {
                    "order": (
                        "این سفارش متعلق به "
                        "مشتری انتخاب‌شده نیست."
                    )
                }
            )

        return attrs