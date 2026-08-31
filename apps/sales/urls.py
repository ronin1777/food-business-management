from rest_framework.routers import DefaultRouter

from .views import (
    CustomerAccountViewSet,
    CustomerPaymentViewSet,
    CustomerTransactionViewSet,
    CustomerViewSet,
    OrderViewSet,
)

router = DefaultRouter()

router.register(
    "customer-payments",
    CustomerPaymentViewSet,
    basename="customer-payment",
)

router.register(
    "customer-accounts",
    CustomerAccountViewSet,
    basename="customer-account",
)

router.register(
    "orders",
    OrderViewSet,
    basename="order",
)
router.register(
    "customers",
    CustomerViewSet,
    basename="customer",
)

router.register(
    "customer-transactions",
    CustomerTransactionViewSet,
    basename="customer-transaction",
)
urlpatterns = router.urls