from django.contrib import admin

# Register your models here.
from django.contrib import admin

from .models import (
    Customer,
    CustomerPayment,
    CustomerTransaction,
    Order,
    OrderItem,
    OrderItemIngredient,
)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
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


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "organization",
        "status",
        "payment_status",
        "ordered_at",
        "created_at",
    )

    search_fields = (
        "customer__name",
    )

    list_filter = (
        "status",
        "payment_status",
        "organization",
        "ordered_at",
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "product",
        "recipe",
        "quantity",
        "unit_price",
        "total_price",
        "material_cost",
        "created_at",
    )

    search_fields = (
        "product__name",
        "order__id",
    )

    list_filter = (
        "product",
    )


@admin.register(OrderItemIngredient)
class OrderItemIngredientAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order_item",
        "ingredient",
        "quantity",
        "unit_cost",
        "total_cost",
        "created_at",
    )

    search_fields = (
        "ingredient__name",
        "order_item__product__name",
    )

    list_filter = (
        "ingredient",
    )


@admin.register(CustomerPayment)
class CustomerPaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "order",
        "amount",
        "method",
        "paid_at",
        "created_at",
    )

    search_fields = (
        "customer__name",
        "order__id",
    )

    list_filter = (
        "method",
        "paid_at",
    )


@admin.register(CustomerTransaction)
class CustomerTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "transaction_type",
        "direction",
        "amount",
        "order",
        "payment",
        "created_at",
    )

    search_fields = (
        "customer__name",
        "order__id",
    )

    list_filter = (
        "transaction_type",
        "direction",
        "created_at",
    )