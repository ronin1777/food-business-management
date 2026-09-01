from rest_framework import status
from rest_framework.response import Response


class StandardResponseMixin:
    """
    Provides a standard API response format for DRF actions.
    """

    def _standard_success_response(
        self,
        data=None,
        *,
        message=None,
        status_code=status.HTTP_200_OK,
    ) -> Response:
        return Response(
            {
                "success": True,
                "data": data,
                "message": message,
                "errors": None,
            },
            status=status_code,
        )

    def list(
        self,
        request,
        *args,
        **kwargs,
    ) -> Response:
        queryset = self.filter_queryset(
            self.get_queryset()
        )

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
            )

            return self.get_paginated_response(
                serializer.data,
            )

        serializer = self.get_serializer(
            queryset,
            many=True,
        )

        return self._standard_success_response(
            data=serializer.data,
        )

    def retrieve(
        self,
        request,
        *args,
        **kwargs,
    ) -> Response:
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
        )

        return self._standard_success_response(
            data=serializer.data,
        )

    def create(
        self,
        request,
        *args,
        **kwargs,
    ) -> Response:
        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        self.perform_create(serializer)

        headers = self.get_success_headers(
            serializer.data
        )

        return Response(
            {
                "success": True,
                "data": serializer.data,
                "message": None,
                "errors": None,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def update(
        self,
        request,
        *args,
        **kwargs,
    ) -> Response:
        partial = kwargs.pop(
            "partial",
            False,
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        self.perform_update(serializer)

        return self._standard_success_response(
            data=serializer.data,
        )