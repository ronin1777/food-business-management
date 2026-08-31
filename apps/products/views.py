from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Product, Recipe
from .serializers import (
    ProductCreateSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductUpdateSerializer,
    RecipeCreateSerializer,
    RecipeDetailSerializer,
    RecipeListSerializer,
)
from .services import ProductService, RecipeService


class ProductViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    search_fields = (
        "name",
    )

    ordering_fields = (
        "name",
        "selling_price",
        "created_at",
        "updated_at",
    )

    ordering = (
        "name",
    )

    def get_queryset(self):
        return Product.objects.filter(
            organization=self.request.user.organization,
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer

        if self.action == "list":
            return ProductListSerializer

        if self.action == "create":
            return ProductCreateSerializer

        return ProductUpdateSerializer

    def create(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        product = ProductService.create_product(
            organization=request.user.organization,
            **serializer.validated_data,
        )

        response_serializer = ProductDetailSerializer(
            product,
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )

    def update(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        product = self.get_object()

        partial = kwargs.pop(
            "partial",
            False,
        )

        serializer = self.get_serializer(
            product,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        product = ProductService.update_product(
            organization=request.user.organization,
            product=product,
            **serializer.validated_data,
        )

        response_serializer = ProductDetailSerializer(
            product,
        )

        return Response(
            response_serializer.data,
        )


class RecipeViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    search_fields = (
        "product__name",
    )

    ordering_fields = (
        "version",
        "valid_from",
        "created_at",
    )

    ordering = (
        "-created_at",
    )

    def get_queryset(self):
        return (
            Recipe.objects
            .filter(
                product__organization=(
                    self.request.user.organization
                ),
            )
            .select_related("product")
            .prefetch_related(
                "items__ingredient",
            )
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return RecipeDetailSerializer

        if self.action == "list":
            return RecipeListSerializer

        return RecipeCreateSerializer

    def create(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        recipe = RecipeService.create_recipe(
            organization=request.user.organization,
            **serializer.validated_data,
        )

        return Response(
            RecipeDetailSerializer(recipe).data,
            status=status.HTTP_201_CREATED,
        )