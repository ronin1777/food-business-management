from rest_framework.routers import DefaultRouter

from .views import ProductViewSet, RecipeViewSet


router = DefaultRouter()

router.register(
    "products",
    ProductViewSet,
    basename="product",
)
router.register(
    "recipes",
    RecipeViewSet,
    basename="recipe",
)

urlpatterns = router.urls