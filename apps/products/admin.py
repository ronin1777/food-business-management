from django.contrib import admin

from .models import Product, Recipe, RecipeItem


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "organization",
        "selling_price",
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "is_active",
        "organization",
    )


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "version",
        "valid_from",
        "valid_to",
        "is_active",
        "created_at",
    )

    search_fields = (
        "product__name",
    )

    list_filter = (
        "is_active",
        "product",
    )


@admin.register(RecipeItem)
class RecipeItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "recipe",
        "ingredient",
        "quantity",
        "unit",
        "base_quantity",
    )

    search_fields = (
        "ingredient__name",
        "recipe__product__name",
    )

    list_filter = (
        "unit",
    )