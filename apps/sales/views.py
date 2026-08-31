from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Customer, CustomerTransaction, Order
from .services import (
    CustomerAccountService,
    CustomerPaymentService,
    OrderService,
)
from .filters import (
    CustomerTransactionFilter,
    OrderFilter,
)
from .serializers import (
    CustomerAccountSerializer,
    CustomerCreateSerializer,
    CustomerDetailSerializer,
    CustomerListSerializer,
    CustomerPaymentCreateSerializer,
    CustomerTransactionSerializer,
    OrderCreateSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
)
from .services import (
    CustomerAccountService,
    CustomerPaymentService,
    CustomerService,
    CustomerTransactionReversalService,
    OrderCancellationService,
    OrderService,
)
from rest_framework.decorators import action




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
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    filterset_class = OrderFilter

    search_fields = (
        "customer__name",
        "note",
    )

    ordering_fields = (
        "ordered_at",
        "created_at",
        "payment_status",
    )

    ordering = (
        "-ordered_at",
    )

    def get_queryset(self):
        return (
            Order.objects
            .filter(
                organization=self.request.user.organization,
            )
            .select_related(
                "customer",
            )
            .prefetch_related(
                "items__product",
                "items__recipe",
            )
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return OrderDetailSerializer

        if self.action == "list":
            return OrderListSerializer

        return OrderCreateSerializer

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

    @action(
        detail=True,
        methods=["post"],
        url_path="cancel",
    )
    def cancel(
        self,
        request: Request,
        pk=None,
    ) -> Response:
        order = OrderCancellationService.cancel_order(
            organization=request.user.organization,
            order_id=pk,
            note=request.data.get(
                "note",
                "",
            ),
        )

        return Response(
            {
                "id": order.id,
                "status": order.status,
                "message": "سفارش با موفقیت لغو شد.",
            },
            status=status.HTTP_200_OK,
        )



class CustomerViewSet(
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
        "note",
    )

    ordering_fields = (
        "name",
        "created_at",
        "updated_at",
    )

    ordering = (
        "name",
    )

    def get_queryset(self):
        return Customer.objects.filter(
            organization=self.request.user.organization,
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CustomerDetailSerializer

        if self.action == "list":
            return CustomerListSerializer

        if self.action == "create":
            return CustomerCreateSerializer

        return CustomerUpdateSerializer

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

        customer = CustomerService.create_customer(
            organization=request.user.organization,
            **serializer.validated_data,
        )

        response_serializer = CustomerDetailSerializer(
            customer,
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
        customer = self.get_object()

        partial = kwargs.pop(
            "partial",
            False,
        )

        serializer = self.get_serializer(
            customer,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        customer = CustomerService.update_customer(
            organization=request.user.organization,
            customer=customer,
            **serializer.validated_data,
        )

        response_serializer = CustomerDetailSerializer(
            customer,
        )

        return Response(
            response_serializer.data,
        )



class CustomerTransactionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    filterset_class = CustomerTransactionFilter

    search_fields = (
        "customer__name",
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
            CustomerTransaction.objects
            .filter(
                organization=(
                    self.request.user.organization
                ),
            )
            .select_related(
                "customer",
                "order",
                "payment",
            )
        )

    def get_serializer_class(self):
        return CustomerTransactionSerializer



    