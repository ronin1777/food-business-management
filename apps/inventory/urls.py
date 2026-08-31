from rest_framework.routers import DefaultRouter

from .views import (
    IngredientViewSet,
    InventoryTransactionViewSet,
)


router = DefaultRouter()

router.register(
    "ingredients",
    IngredientViewSet,
    basename="ingredient",
)

router.register(
    "inventory-transactions",
    InventoryTransactionViewSet,
    basename="inventory-transaction",
)

urlpatterns = router.urls