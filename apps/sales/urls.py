from rest_framework.routers import DefaultRouter

from .views import (
    CustomerAccountViewSet,
    CustomerPaymentViewSet,
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

urlpatterns = router.urls