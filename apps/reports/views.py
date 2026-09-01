from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.responses import APIResponse
from .services.profitability import (
    ProfitabilityReportService,
)

from .services.inventory import (
    InventoryReportService,
)

from .serializers import (
    CustomerReportSerializer,
    InventoryReportSerializer,
    ProfitabilityReportSerializer,
    PurchaseReportSerializer,
    ReportPeriodSerializer,
    SalesReportSerializer,
    SupplierReportSerializer,
)

from .services.suppliers import (
    SupplierReportService,
)

from .services.customers import (
    CustomerReportService,
)
from .services.sales import SalesReportService


class SalesReportViewSet(
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def list(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        serializer_data = {
            "date_from": request.query_params.get(
                "date_from"
            ),
            "date_to": request.query_params.get(
                "date_to"
            ),
        }

        period_serializer = ReportPeriodSerializer(
            data=serializer_data,
        )

        period_serializer.is_valid(
            raise_exception=True,
        )

        data = SalesReportService.get_report(
            organization_id=(
                request.user.organization_id
            ),
            **period_serializer.validated_data,
        )

        serializer = SalesReportSerializer(
            data,
        )

        return APIResponse.success(
            data=serializer.data,
        )




class PurchaseReportViewSet(
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def list(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        period_serializer = ReportPeriodSerializer(
            data={
                "date_from": request.query_params.get(
                    "date_from",
                ),
                "date_to": request.query_params.get(
                    "date_to",
                ),
            },
        )

        period_serializer.is_valid(
            raise_exception=True,
        )

        report = PurchaseReportService.get_report(
            organization_id=(
                request.user.organization_id
            ),
            **period_serializer.validated_data,
        )

        serializer = PurchaseReportSerializer(
            report,
        )

        return APIResponse.success(
            data=serializer.data,
        )



class ProfitabilityReportViewSet(
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def list(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        period_serializer = ReportPeriodSerializer(
            data={
                "date_from": request.query_params.get(
                    "date_from",
                ),
                "date_to": request.query_params.get(
                    "date_to",
                ),
            },
        )

        period_serializer.is_valid(
            raise_exception=True,
        )

        report = ProfitabilityReportService.get_report(
            organization_id=(
                request.user.organization_id
            ),
            **period_serializer.validated_data,
        )

        serializer = ProfitabilityReportSerializer(
            report,
        )

        return APIResponse.success(
            data=serializer.data,
        )




class InventoryReportViewSet(
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def list(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        report = InventoryReportService.get_report(
            organization_id=(
                request.user.organization_id
            ),
        )

        serializer = InventoryReportSerializer(
            report,
        )

        return APIResponse.success(
            data=serializer.data,
        )



class CustomerReportViewSet(
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def list(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        report = CustomerReportService.get_report(
            organization_id=(
                request.user.organization_id
            ),
        )

        serializer = CustomerReportSerializer(
            report,
        )

        return APIResponse.success(
            data=serializer.data,
        )



class SupplierReportViewSet(
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def list(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        report = SupplierReportService.get_report(
            organization_id=(
                request.user.organization_id
            ),
        )

        serializer = SupplierReportSerializer(
            report,
        )

        return APIResponse.success(
            data=serializer.data,
        )