from rest_framework.routers import DefaultRouter

from .views import (
    CustomerAccountViewSet,
    CustomerPaymentViewSet,
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

urlpatterns = router.urls