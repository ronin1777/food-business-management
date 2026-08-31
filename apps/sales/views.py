from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Customer, Order
from .services import (
    CustomerAccountService,
    CustomerPaymentService,
    OrderService,
)
from .serializers import CustomerAccountSerializer, CustomerPaymentCreateSerializer, OrderCreateSerializer
from .services import CustomerAccountService, CustomerPaymentService


class CustomerPaymentViewSet(
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return CustomerPaymentCreateSerializer

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

        payment = CustomerPaymentService.create_payment(
            organization=request.user.organization,
            **serializer.validated_data,
        )

        return Response(
            {
                "id": payment.id,
                "message": "پرداخت مشتری با موفقیت ثبت شد.",
            },
            status=status.HTTP_201_CREATED,
        )



class CustomerAccountViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def retrieve(
        self,
        request: Request,
        pk=None,
        *args,
        **kwargs,
    ) -> Response:
        customer = get_object_or_404(
            Customer,
            pk=pk,
            organization=request.user.organization,
        )

        account = CustomerAccountService.get_account(
            organization=request.user.organization,
            customer=customer,
        )

        serializer = CustomerAccountSerializer(account)

        return Response(serializer.data)


class OrderViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(
                organization=self.request.user.organization,
            )
            .select_related("customer")
        )

    def get_serializer_class(self):
        return OrderCreateSerializer

    def list(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        orders = self.get_queryset()

        data = [
            {
                "id": order.id,
                "customer": (
                    order.customer.name
                    if order.customer
                    else None
                ),
                "status": order.status,
                "ordered_at": order.ordered_at,
                "note": order.note,
            }
            for order in orders
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

        order = OrderService.create_order(
            organization=request.user.organization,
            **serializer.validated_data,
        )

        return Response(
            {
                "id": order.id,
                "message": "سفارش با موفقیت ثبت شد.",
            },
            status=status.HTTP_201_CREATED,
        )