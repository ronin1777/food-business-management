from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Purchase
from .serializers import (
    PurchaseCreateSerializer,
    SupplierAccountSerializer,
    SupplierPaymentCreateSerializer,
)
from .services import PurchaseService, SupplierAccountService, SupplierPaymentService
from .models import Purchase, Supplier

class PurchaseViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Purchase.objects
            .filter(
                organization=self.request.user.organization,
            )
            .select_related("supplier")
        )

    def get_serializer_class(self):
        return PurchaseCreateSerializer

    def list(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        purchases = self.get_queryset()

        data = [
            {
                "id": purchase.id,
                "supplier": (
                    purchase.supplier.name
                    if purchase.supplier
                    else None
                ),
                "purchased_at": purchase.purchased_at,
                "note": purchase.note,
            }
            for purchase in purchases
        ]

        return Response(data)

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



class SupplierAccountViewSet(viewsets.GenericViewSet):
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