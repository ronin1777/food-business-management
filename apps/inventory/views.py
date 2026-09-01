from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .filters import InventoryTransactionFilter
from .models import Ingredient, InventoryTransaction
from .serializers import (
    IngredientCreateSerializer,
    IngredientDetailSerializer,
    IngredientListSerializer,
    IngredientUpdateSerializer,
    InventoryAdjustmentCreateSerializer,
    InventoryTransactionDetailSerializer,
    InventoryTransactionListSerializer,
    InventoryWasteCreateSerializer,
)
from .services import (
    IngredientService,
    InventoryAdjustmentService,
    InventoryCostService,
    InventoryWasteService,
)

from apps.core.responses import APIResponse



class IngredientViewSet(
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
        "current_stock",
        "created_at",
        "updated_at",
    )

    ordering = (
        "name",
    )

    def get_queryset(self):
        return Ingredient.objects.filter(
            organization=self.request.user.organization,
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return IngredientDetailSerializer

        if self.action == "list":
            return IngredientListSerializer

        if self.action == "create":
            return IngredientCreateSerializer

        return IngredientUpdateSerializer

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

        ingredient = IngredientService.create_ingredient(
            organization=request.user.organization,
            **serializer.validated_data,
        )

        response_serializer = IngredientDetailSerializer(
            ingredient,
        )

        return APIResponse.success(
            data=response_serializer.data,
            message="ماده اولیه با موفقیت ایجاد شد.",
            status_code=status.HTTP_201_CREATED,
        )

    def update(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        ingredient = self.get_object()

        partial = kwargs.pop(
            "partial",
            False,
        )

        serializer = self.get_serializer(
            ingredient,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        ingredient = IngredientService.update_ingredient(
            organization=request.user.organization,
            ingredient=ingredient,
            **serializer.validated_data,
        )

        response_serializer = IngredientDetailSerializer(
            ingredient,
        )

        return APIResponse.success(
            data=response_serializer.data,
            message="ماده اولیه با موفقیت به‌روزرسانی شد.",
        )


    


class InventoryTransactionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    filterset_class = InventoryTransactionFilter

    search_fields = (
        "ingredient__name",
        "note",
    )

    ordering_fields = (
        "created_at",
        "quantity",
        "total_cost",
    )

    ordering = (
        "-created_at",
    )

    def get_queryset(self):
        return (
            InventoryTransaction.objects
            .filter(
                organization=self.request.user.organization,
            )
            .select_related(
                "ingredient",
                "created_by",
                "purchase_item",
                "order_item_ingredient",
            )
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return InventoryTransactionDetailSerializer

        return InventoryTransactionListSerializer


    



class InventoryAdjustmentViewSet(
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    serializer_class = InventoryAdjustmentCreateSerializer

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

        adjustment = (
            InventoryAdjustmentService.adjust_stock(
                organization=(
                    request.user.organization
                ),
                **serializer.validated_data,
            )
        )

        return APIResponse.success(
            data={
                "id": adjustment.id,
            },
            message="اصلاح موجودی با موفقیت ثبت شد.",
            status_code=status.HTTP_201_CREATED,
        )


class InventoryWasteViewSet(
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    serializer_class = InventoryWasteCreateSerializer

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

        waste = InventoryWasteService.record_waste(
            organization=request.user.organization,
            **serializer.validated_data,
        )

        return APIResponse.success(
            data={
                "id": waste.id,
            },
            message="دورریز با موفقیت ثبت شد.",
            status_code=status.HTTP_201_CREATED,
        )