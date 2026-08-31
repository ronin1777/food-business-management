from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Customer

from .serializers import CustomerAccountSerializer, CustomerPaymentCreateSerializer
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