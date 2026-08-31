import django_filters

from .models import (
    CustomerTransaction,
    Order,
)


class OrderFilter(django_filters.FilterSet):
    customer = django_filters.NumberFilter(
        field_name="customer_id",
    )

    status = django_filters.CharFilter(
        field_name="status",
    )

    payment_status = django_filters.CharFilter(
        field_name="payment_status",
    )

    ordered_at_after = django_filters.IsoDateTimeFilter(
        field_name="ordered_at",
        lookup_expr="gte",
    )

    ordered_at_before = django_filters.IsoDateTimeFilter(
        field_name="ordered_at",
        lookup_expr="lte",
    )

    class Meta:
        model = Order
        fields = (
            "customer",
            "status",
            "payment_status",
        )


class CustomerTransactionFilter(
    django_filters.FilterSet,
):
    customer = django_filters.NumberFilter(
        field_name="customer_id",
    )

    transaction_type = django_filters.CharFilter(
        field_name="transaction_type",
    )

    direction = django_filters.CharFilter(
        field_name="direction",
    )

    order = django_filters.NumberFilter(
        field_name="order_id",
    )

    created_at_after = django_filters.IsoDateTimeFilter(
        field_name="created_at",
        lookup_expr="gte",
    )

    created_at_before = django_filters.IsoDateTimeFilter(
        field_name="created_at",
        lookup_expr="lte",
    )

    class Meta:
        model = CustomerTransaction
        fields = (
            "customer",
            "transaction_type",
            "direction",
            "order",
        )