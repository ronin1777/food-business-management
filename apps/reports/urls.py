from rest_framework.routers import DefaultRouter

from .views import (
    CustomerReportViewSet,
    InventoryReportViewSet,
    ProfitabilityReportViewSet,
    PurchaseReportViewSet,
    SalesReportViewSet,
    SupplierReportViewSet,
)

router = DefaultRouter()

router.register(
    "reports/sales",
    SalesReportViewSet,
    basename="sales-report",
)

router.register(
    "reports/purchases",
    PurchaseReportViewSet,
    basename="purchase-report",
)

router.register(
    "reports/profitability",
    ProfitabilityReportViewSet,
    basename="profitability-report",
)

router.register(
    "reports/inventory",
    InventoryReportViewSet,
    basename="inventory-report",
)

router.register(
    "reports/customers",
    CustomerReportViewSet,
    basename="customer-report",
)


router.register(
    "reports/suppliers",
    SupplierReportViewSet,
    basename="supplier-report",
)


urlpatterns = router.urls