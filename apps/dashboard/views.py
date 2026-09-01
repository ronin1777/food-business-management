from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.responses import APIResponse
from apps.reports.filters import ReportPeriodSerializer

from .serializers import DashboardSerializer
from .services.summary import DashboardService


class DashboardViewSet(
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

        dashboard = DashboardService.get_summary(
            organization_id=(
                request.user.organization_id
            ),
            **period_serializer.validated_data,
        )

        serializer = DashboardSerializer(
            dashboard,
        )

        return APIResponse.success(
            data=serializer.data,
        )