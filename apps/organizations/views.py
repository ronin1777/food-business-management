from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.responses import APIResponse

from .models import Organization
from .serializers import OrganizationSerializer


class OrganizationViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return Organization.objects.filter(
            pk=self.request.user.organization.id,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="me",
    )
    def me(
        self,
        request: Request,
    ) -> Response:
        organization = request.user.organization

        serializer = self.get_serializer(
            organization,
        )

        return APIResponse.success(
            data=serializer.data,
        )

    def retrieve(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        organization = self.get_object()

        serializer = self.get_serializer(
            organization,
        )

        return APIResponse.success(
            data=serializer.data,
        )

    def update(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        organization = self.get_object()

        partial = kwargs.pop(
            "partial",
            False,
        )

        serializer = self.get_serializer(
            organization,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        organization = serializer.save()

        return APIResponse.success(
            data=self.get_serializer(
                organization,
            ).data,
            message="اطلاعات سازمان با موفقیت به‌روزرسانی شد.",
        )