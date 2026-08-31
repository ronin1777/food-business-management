from django.contrib import admin

from .models import Ingredient


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = (
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
    )
    search_fields = (
        "name",
    )