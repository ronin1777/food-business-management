import django_filters

from .models import InventoryTransaction


class InventoryTransactionFilter(
    django_filters.FilterSet,
):
    ingredient = django_filters.NumberFilter(
        field_name="ingredient_id",
    )

    transaction_type = django_filters.CharFilter(
        field_name="transaction_type",
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
        model = InventoryTransaction
        fields = (
            "ingredient",
            "transaction_type",
        )