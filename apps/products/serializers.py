from decimal import Decimal

from rest_framework import serializers

from apps.inventory.models import Ingredient

from .models import Product, Recipe, RecipeItem


class ProductListSerializer(serializers.ModelSerializer):
    has_valid_recipe = serializers.BooleanField(
        read_only=True,
    )

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "selling_price",
            "is_active",
            "created_at",
            "updated_at",
            "has_valid_recipe",
        )
        read_only_fields = fields


class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "selling_price",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class ProductCreateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=150,
    )

    selling_price = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0"),
    )

    is_active = serializers.BooleanField(
        required=False,
        default=True,
    )


class ProductUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=150,
        required=False,
    )

    selling_price = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0"),
        required=False,
    )

    is_active = serializers.BooleanField(
        required=False,
    )



class RecipeItemInputSerializer(serializers.Serializer):
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



class RecipeListSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    class Meta:
        model = Recipe
        fields = (
            "id",
            "product",
            "product_name",
            "version",
            "valid_from",
            "valid_to",
            "is_active",
            "created_at",
        )
        read_only_fields = fields



class RecipeCreateSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
    )

    valid_from = serializers.DateTimeField()

    valid_to = serializers.DateTimeField(
        required=False,
        allow_null=True,
    )

    is_active = serializers.BooleanField(
        required=False,
        default=True,
    )

    items = RecipeItemInputSerializer(
        many=True,
        allow_empty=False,
    )



class RecipeItemDetailSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(
        source="ingredient.name",
        read_only=True,
    )

    class Meta:
        model = RecipeItem
        fields = (
            "id",
            "ingredient",
            "ingredient_name",
            "quantity",
            "unit",
            "base_quantity",

        )
        read_only_fields = fields


class RecipeDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    items = RecipeItemDetailSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Recipe
        fields = (
            "id",
            "product",
            "product_name",
            "version",
            "valid_from",
            "valid_to",
            "is_active",
            "items",

        )
        read_only_fields = fields