from rest_framework import serializers


class SalesReportSerializer(
    serializers.Serializer,
):
    period = serializers.DictField()

    summary = serializers.DictField()

    daily_sales = serializers.ListField(
        child=serializers.DictField(),
    )

    top_products = serializers.ListField(
        child=serializers.DictField(),
    )


class PurchaseReportSerializer(
    serializers.Serializer,
):
    period = serializers.DictField()

    summary = serializers.DictField()

    daily_purchases = serializers.ListField(
        child=serializers.DictField(),
    )

    top_ingredients = serializers.ListField(
        child=serializers.DictField(),
    )


class ProfitabilityReportSerializer(
    serializers.Serializer,
):
    period = serializers.DictField()

    summary = serializers.DictField()

    daily_profitability = serializers.ListField(
        child=serializers.DictField(),
    )

    top_products = serializers.ListField(
        child=serializers.DictField(),
    )


class InventoryReportSerializer(
    serializers.Serializer,
):
    summary = serializers.DictField()

    by_unit_type = serializers.ListField(
        child=serializers.DictField(),
    )

    ingredients = serializers.ListField(
        child=serializers.DictField(),
    )


class CustomerReportSerializer(
    serializers.Serializer,
):
    summary = serializers.DictField()

    top_customers_by_sales = serializers.ListField(
        child=serializers.DictField(),
    )

    top_customers_by_balance = serializers.ListField(
        child=serializers.DictField(),
    )


class SupplierReportSerializer(
    serializers.Serializer,
):
    summary = serializers.DictField()

    top_suppliers_by_purchases = serializers.ListField(
        child=serializers.DictField(),
    )

    top_suppliers_by_balance = serializers.ListField(
        child=serializers.DictField(),
    )


class ReportPeriodSerializer(
    serializers.Serializer,
):
    date_from = serializers.DateField(
        required=True,
    )

    date_to = serializers.DateField(
        required=True,
    )

    def validate(self, attrs):
        date_from = attrs["date_from"]
        date_to = attrs["date_to"]

        if date_from > date_to:
            raise serializers.ValidationError(
                {
                    "date_from": (
                        "تاریخ شروع نمی‌تواند "
                        "بعد از تاریخ پایان باشد."
                    )
                }
            )

        return attrs