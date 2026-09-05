from datetime import date
from typing import TypedDict, cast

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.responses import APIResponse

from .serializers import (
    CustomerReportSerializer,
    InventoryReportSerializer,
    ProfitabilityReportSerializer,
    PurchaseReportSerializer,
    ReportPeriodSerializer,
    SalesReportSerializer,
    SupplierReportSerializer,
)
from .services.customers import CustomerReportService
from .services.inventory import InventoryReportService
from .services.profitability import ProfitabilityReportService
from .services.purchases import PurchaseReportService
from .services.sales import SalesReportService
from .services.suppliers import SupplierReportService


class ReportPeriodData(TypedDict):
    date_from: date
    date_to: date


class SalesReportViewSet(viewsets.GenericViewSet):
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

        period = cast(
            ReportPeriodData,
            period_serializer.validated_data,
        )

        report = SalesReportService.get_report(
            organization_id=request.user.organization.id,
            date_from=period["date_from"],
            date_to=period["date_to"],
        )

        serializer = SalesReportSerializer(
            report,
        )

        return APIResponse.success(
            data=serializer.data,
        )


class PurchaseReportViewSet(viewsets.GenericViewSet):
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

        period = cast(
            ReportPeriodData,
            period_serializer.validated_data,
        )

        report = PurchaseReportService.get_report(
            organization_id=request.user.organization.id,
            date_from=period["date_from"],
            date_to=period["date_to"],
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

        period = cast(
            ReportPeriodData,
            period_serializer.validated_data,
        )

        report = ProfitabilityReportService.get_report(
            organization_id=request.user.organization.id,
            date_from=period["date_from"],
            date_to=period["date_to"],
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
            organization_id=request.user.organization.id,
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
            organization_id=request.user.organization.id,
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
            organization_id=request.user.organization.id,
        )

        serializer = SupplierReportSerializer(
            report,
        )

        return APIResponse.success(
            data=serializer.data,
        )