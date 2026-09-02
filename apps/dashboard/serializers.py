from rest_framework import serializers


class DashboardPeriodSerializer(
    serializers.Serializer,
):
    date_from = serializers.DateField()

    date_to = serializers.DateField()


class DashboardMetricSerializer(
    serializers.Serializer,
):
    current = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        allow_null=True,
    )

    previous = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        allow_null=True,
    )

    percentage_change = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        allow_null=True,
    )

    direction = serializers.ChoiceField(
        choices=(
            "up",
            "down",
            "unchanged",
        ),
    )


class DashboardKPISerializer(
    serializers.Serializer,
):
    sales = serializers.DictField()

    purchases = serializers.DictField()

    gross_profit = serializers.DictField()

    gross_margin = serializers.DictField()

    orders = serializers.DictField()

    receivables = serializers.DictField()

    payables = serializers.DictField()

    inventory_value = serializers.DictField()


class DashboardTrendSerializer(
    serializers.Serializer,
):
    date = serializers.DateField()

    value = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
    )


class DashboardProductSalesSerializer(
    serializers.Serializer,
):
    product_id = serializers.IntegerField()

    product_name = serializers.CharField()

    quantity_sold = serializers.DecimalField(
        max_digits=20,
        decimal_places=3,
    )

    sales = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
    )


class DashboardProductProfitSerializer(
    serializers.Serializer,
):
    product_id = serializers.IntegerField()

    product_name = serializers.CharField()

    quantity_sold = serializers.DecimalField(
        max_digits=20,
        decimal_places=3,
    )

    sales = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
    )

    material_cost = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
    )

    gross_profit = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
    )

    gross_margin = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
    )


class DashboardCustomerSerializer(
    serializers.Serializer,
):
    customer_id = serializers.IntegerField()

    customer_name = serializers.CharField()

    total_sales = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        required=False,
    )

    balance = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        required=False,
    )


class DashboardSupplierSerializer(
    serializers.Serializer,
):
    supplier_id = serializers.IntegerField()

    supplier_name = serializers.CharField()

    total_purchases = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        required=False,
    )

    balance = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        required=False,
    )


class DashboardIngredientSerializer(
    serializers.Serializer,
):
    id = serializers.IntegerField()

    name = serializers.CharField()

    unit_type = serializers.CharField()

    base_unit = serializers.CharField()

    current_stock = serializers.DecimalField(
        max_digits=20,
        decimal_places=3,
    )

    minimum_stock = serializers.DecimalField(
        max_digits=20,
        decimal_places=3,
    )

    current_inventory_value = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
    )

    average_unit_cost = serializers.DecimalField(
        max_digits=20,
        decimal_places=6,
    )

    is_active = serializers.BooleanField()

    is_out_of_stock = serializers.BooleanField()

    is_low_stock = serializers.BooleanField()




class DashboardInventorySerializer(
    serializers.Serializer,
):
    total_value = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
    )

    out_of_stock_count = serializers.IntegerField()

    low_stock_count = serializers.IntegerField()

    ingredients = DashboardIngredientSerializer(
        many=True,
    )


class DashboardProductsSerializer(
    serializers.Serializer,
):
    top_by_sales = DashboardProductSalesSerializer(
        many=True,
    )

    top_by_profit = DashboardProductProfitSerializer(
        many=True,
    )


class DashboardCustomersSerializer(
    serializers.Serializer,
):
    top_by_sales = DashboardCustomerSerializer(
        many=True,
    )

    top_by_balance = DashboardCustomerSerializer(
        many=True,
    )


class DashboardSuppliersSerializer(
    serializers.Serializer,
):
    top_by_purchases = DashboardSupplierSerializer(
        many=True,
    )

    top_by_balance = DashboardSupplierSerializer(
        many=True,
    )


class DashboardInsightSerializer(
    serializers.Serializer,
):
    type = serializers.CharField()

    severity = serializers.ChoiceField(
        choices=(
            "positive",
            "info",
            "warning",
            "critical",
        ),
    )

    title = serializers.CharField()

    message = serializers.CharField()

    metric = serializers.CharField()


class DashboardRecentOrderSerializer(
    serializers.Serializer,
):
    id = serializers.IntegerField()

    customer_name = serializers.CharField()

    status = serializers.CharField()

    payment_status = serializers.CharField()

    ordered_at = serializers.DateTimeField()



class DashboardSerializer(
    serializers.Serializer,
):
    period = DashboardPeriodSerializer()

    kpis = DashboardKPISerializer()

    trends = serializers.DictField()

    products = DashboardProductsSerializer()

    inventory = DashboardInventorySerializer()

    customers = DashboardCustomersSerializer()

    suppliers = DashboardSuppliersSerializer()



    insights = DashboardInsightSerializer(
        many=True,
    )


    recent_orders = DashboardRecentOrderSerializer(
    many=True,
)

