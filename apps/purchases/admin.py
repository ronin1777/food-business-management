from django.contrib import admin

from .models import (
    Purchase,
    PurchaseAdditionalCost,
    PurchaseItem,
    Supplier,
)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "phone",
        "organization",
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "phone",
    )

    list_filter = (
        "is_active",
        "organization",
    )


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "supplier",
        "organization",
        "purchased_at",
        "created_at",
    )

    search_fields = (
        "supplier__name",
    )

    list_filter = (
        "organization",
        "purchased_at",
    )


@admin.register(PurchaseItem)
class PurchaseItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "purchase",
        "ingredient",
        "quantity",
        "unit",
        "base_quantity",
        "unit_price",
        "discount",
        "total_price",
    )

    search_fields = (
        "ingredient__name",
    )

    list_filter = (
        "unit",
    )


@admin.register(PurchaseAdditionalCost)
class PurchaseAdditionalCostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "purchase",
        "cost_type",
        "amount",
        "created_at",
    )

    list_filter = (
        "cost_type",
    )