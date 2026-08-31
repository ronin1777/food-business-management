import django_filters

from .models import Purchase, SupplierTransaction


class PurchaseFilter(django_filters.FilterSet):
    supplier = django_filters.NumberFilter(
        field_name="supplier_id",
    )

    purchased_at_after = django_filters.IsoDateTimeFilter(
        field_name="purchased_at",
        lookup_expr="gte",
    )

    purchased_at_before = django_filters.IsoDateTimeFilter(
        field_name="purchased_at",
        lookup_expr="lte",
    )

    class Meta:
        model = Purchase
        fields = (
            "supplier",
        )


class SupplierTransactionFilter(
    django_filters.FilterSet,
):
    supplier = django_filters.NumberFilter(
        field_name="supplier_id",
    )

    transaction_type = django_filters.CharFilter(
        field_name="transaction_type",
    )

    direction = django_filters.CharFilter(
        field_name="direction",
    )

    purchase = django_filters.NumberFilter(
        field_name="purchase_id",
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
        model = SupplierTransaction
        fields = (
            "supplier",
            "transaction_type",
            "direction",
            "purchase",
        )