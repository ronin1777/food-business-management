from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Purchase, SupplierTransaction
from .serializers import (
    PurchaseCreateSerializer,
    SupplierAccountSerializer,
    SupplierPaymentCreateSerializer,
    SupplierTransactionSerializer,
)
from .filters import PurchaseFilter, SupplierTransactionFilter
from .serializers import (
    PurchaseCreateSerializer,
    PurchaseDetailSerializer,
    PurchaseListSerializer,
    SupplierDetailSerializer,
    SupplierListSerializer,
)
from .services import PurchaseService, SupplierAccountService, SupplierPaymentService
from .models import Purchase, Supplier
from .services import (
    PurchaseService,
    SupplierService,
)


class PurchaseViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    filterset_class = PurchaseFilter

    search_fields = (
        "supplier__name",
        "note",
    )

    ordering_fields = (
        "purchased_at",
        "created_at",
    )

    ordering = (
        "-purchased_at",
    )

    def get_queryset(self):
        return (
            Purchase.objects
            .filter(
                organization=self.request.user.organization,
            )
            .select_related(
                "supplier",
            )
            .prefetch_related(
                "items__ingredient",
                "additional_costs",
            )
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PurchaseDetailSerializer

        if self.action == "list":
            return PurchaseListSerializer

        return PurchaseCreateSerializer

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

        purchase = PurchaseService.create_purchase(
            organization=request.user.organization,
            **serializer.validated_data,
        )

        return Response(
            {
                "id": purchase.id,
                "message": "خرید با موفقیت ثبت شد.",
            },
            status=status.HTTP_201_CREATED,
        )
    
    

class SupplierPaymentViewSet(
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return SupplierPaymentCreateSerializer

    def create(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        serializer = self.get_serializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        payment = SupplierPaymentService.create_payment(
            organization=request.user.organization,
            **serializer.validated_data,
        )

        return Response(
            {
                "id": payment.id,
                "message": "پرداخت تأمین‌کننده با موفقیت ثبت شد.",
            },
            status=status.HTTP_201_CREATED,
        )



class SupplierAccountViewSet(
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def retrieve(
        self,
        request: Request,
        pk=None,
        *args,
        **kwargs,
    ) -> Response:
        supplier = get_object_or_404(
            Supplier,
            pk=pk,
            organization=request.user.organization,
        )

        account = SupplierAccountService.get_account(
            organization=request.user.organization,
            supplier=supplier,
        )

        serializer = SupplierAccountSerializer(account)

        return Response(serializer.data)




class SupplierViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    search_fields = (
        "name",
        "phone",
    )

    ordering_fields = (
        "name",
        "created_at",
    )

    ordering = (
        "name",
    )

    def get_queryset(self):
        return Supplier.objects.filter(
            organization=self.request.user.organization,
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return SupplierDetailSerializer

        if self.action == "list":
            return SupplierListSerializer

        if self.action == "create":
            return SupplierCreateSerializer

        return SupplierUpdateSerializer

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

        supplier = SupplierService.create_supplier(
            organization=request.user.organization,
            **serializer.validated_data,
        )

        response_serializer = SupplierDetailSerializer(
            supplier,
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
        supplier = self.get_object()

        partial = kwargs.pop("partial", False)

        serializer = self.get_serializer(
            supplier,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        supplier = SupplierService.update_supplier(
            organization=request.user.organization,
            supplier=supplier,
            **serializer.validated_data,
        )

        response_serializer = SupplierDetailSerializer(
            supplier,
        )

        return Response(
            response_serializer.data,
        )


class SupplierTransactionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    filterset_class = SupplierTransactionFilter

    search_fields = (
        "supplier__name",
        "note",
    )

    ordering_fields = (
        "created_at",
        "amount",
    )

    ordering = (
        "-created_at",
    )

    def get_queryset(self):
     return (
            SupplierTransaction.objects
            .filter(
            organization=self.request.user.organization,
            )
            .select_related(
            "supplier",
            "purchase",
            "payment",
        )
    )

    def get_serializer_class(self):
        return SupplierTransactionSerializer