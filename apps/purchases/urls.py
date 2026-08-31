from rest_framework.routers import DefaultRouter

from .views import (
    PurchaseViewSet,
    SupplierAccountViewSet,
    SupplierPaymentViewSet,
    SupplierTransactionViewSet,
    SupplierViewSet,
)


router = DefaultRouter()


router.register(
    "purchases",
    PurchaseViewSet,
    basename="purchase",
)

router.register(
    "suppliers",
    SupplierViewSet,
    basename="supplier",
)

router.register(
    "supplier-payments",
    SupplierPaymentViewSet,
    basename="supplier-payment",
)

router.register(
    "supplier-accounts",
    SupplierAccountViewSet,
    basename="supplier-account",
)

router.register(
    "supplier-transactions",
    SupplierTransactionViewSet,
    basename="supplier-transaction",
)


urlpatterns = router.urls