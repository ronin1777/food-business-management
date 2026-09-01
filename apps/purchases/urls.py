from rest_framework.routers import DefaultRouter

from .views import (
    PurchaseViewSet,
    SupplierAccountViewSet,
    SupplierPaymentViewSet,
    SupplierRefundViewSet,
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

router.register(
    "supplier-refunds",
    SupplierRefundViewSet,
    basename="supplier-refund",
)

urlpatterns = router.urls