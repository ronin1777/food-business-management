from typing import Any

from rest_framework.response import Response


class APIResponse:
    @staticmethod
    def success(
        *,
        data: Any = None,
        message: str | None = None,
        status_code: int = 200,
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

    @staticmethod
    def error(
        *,
        message: str,
        errors: Any = None,
        status_code: int = 400,
    ) -> Response:
        return Response(
            {
                "success": False,
                "data": None,
                "message": message,
                "errors": errors,
            },
            status=status_code,
        )