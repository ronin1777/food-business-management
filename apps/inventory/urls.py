from rest_framework.routers import DefaultRouter

from .views import (
    IngredientViewSet,
    InventoryAdjustmentViewSet,
    InventoryTransactionViewSet,
    InventoryWasteViewSet,
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

router.register(
    "inventory-adjustments",
    InventoryAdjustmentViewSet,
    basename="inventory-adjustment",
)

router.register(
    "inventory-waste",
    InventoryWasteViewSet,
    basename="inventory-waste",
)

urlpatterns = router.urls