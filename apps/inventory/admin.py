from django.contrib import admin

from .models import Ingredient


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "organization",
        "unit_type",
        "current_stock",
        "is_active",
        "created_at",
    )

    list_filter = (
        "unit_type",
        "is_active",
        "organization",
    )

    search_fields = (
        "name",
    )