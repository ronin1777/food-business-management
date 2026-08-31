from rest_framework.routers import DefaultRouter

from .views import (
    PurchaseViewSet,
    SupplierAccountViewSet,
    SupplierPaymentViewSet,
)


router = DefaultRouter()

router.register(
    "purchases",
    PurchaseViewSet,
    basename="purchase",
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

urlpatterns = router.urls