from decimal import Decimal

from rest_framework import serializers

from .models import (
    Ingredient,
    IngredientUnitType,
    InventoryTransaction,
)


class IngredientListSerializer(serializers.ModelSerializer):
    base_unit = serializers.CharField(
        read_only=True,
    )

    average_unit_cost = serializers.DecimalField(
        max_digits=14,
        decimal_places=6,
        read_only=True,
    )

    class Meta:
        model = Ingredient
        fields = (
            "id",
            "name",
            "unit_type",
            "base_unit",
            "current_stock",
            "current_inventory_value",
            "average_unit_cost",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class IngredientDetailSerializer(serializers.ModelSerializer):
    base_unit = serializers.CharField(
        read_only=True,
    )

    average_unit_cost = serializers.DecimalField(
        max_digits=14,
        decimal_places=6,
        read_only=True,
    )

    class Meta:
        model = Ingredient
        fields = (
            "id",
            "name",
            "unit_type",
            "base_unit",
            "current_stock",
            "current_inventory_value",
            "average_unit_cost",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class IngredientCreateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=150,
    )

    unit_type = serializers.ChoiceField(
        choices=IngredientUnitType.choices,
    )

    is_active = serializers.BooleanField(
        required=False,
        default=True,
    )


class IngredientUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=150,
        required=False,
    )

    unit_type = serializers.ChoiceField(
        choices=IngredientUnitType.choices,
        required=False,
    )

    is_active = serializers.BooleanField(
        required=False,
    )



class InventoryTransactionListSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(
        source="ingredient.name",
        read_only=True,
    )

    transaction_type_display = serializers.CharField(
        source="get_transaction_type_display",
        read_only=True,
    )

    class Meta:
        model = InventoryTransaction
        fields = (
            "id",
            "ingredient",
            "ingredient_name",
            "transaction_type",
            "transaction_type_display",
            "quantity",
            "unit_cost",
            "total_cost",
            "purchase_item",
            "order_item_ingredient",
            "created_by",
            "created_at",
        )
        read_only_fields = fields


class InventoryTransactionDetailSerializer(
    serializers.ModelSerializer,
):
    ingredient_name = serializers.CharField(
        source="ingredient.name",
        read_only=True,
    )

    transaction_type_display = serializers.CharField(
        source="get_transaction_type_display",
        read_only=True,
    )

    class Meta:
        model = InventoryTransaction
        fields = (
            "id",
            "organization",
            "ingredient",
            "ingredient_name",
            "transaction_type",
            "transaction_type_display",
            "quantity",
            "unit_cost",
            "total_cost",
            "purchase_item",
            "order_item_ingredient",
            "note",
            "created_by",
            "created_at",
        )
        read_only_fields = fields



class InventoryAdjustmentCreateSerializer(
    serializers.Serializer,
):
    ingredient = serializers.PrimaryKeyRelatedField(
        queryset=Ingredient.objects.all(),
    )

    quantity = serializers.DecimalField(
        max_digits=14,
        decimal_places=3,
    )

    unit_cost = serializers.DecimalField(
        max_digits=14,
        decimal_places=6,
        required=False,
        allow_null=True,
        min_value=Decimal("0"),
    )

    note = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )


class InventoryWasteCreateSerializer(
    serializers.Serializer,
):
    ingredient = serializers.PrimaryKeyRelatedField(
        queryset=Ingredient.objects.all(),
    )

    quantity = serializers.DecimalField(
        max_digits=14,
        decimal_places=3,
        min_value=Decimal("0.001"),
    )

    note = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )