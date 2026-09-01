import logging
from typing import Any

from django.core.exceptions import (
    ValidationError as DjangoValidationError,
)

from rest_framework import status
from rest_framework.exceptions import (
    ValidationError as DRFValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler


logger = logging.getLogger(__name__)


def _normalize_django_validation_error(
    exc: DjangoValidationError,
) -> dict[str, Any]:
    if hasattr(exc, "message_dict"):
        return exc.message_dict

    return {
        "non_field_errors": exc.messages,
    }


def custom_exception_handler(
    exc: Exception,
    context,
):
    # --------------------------------------------------------
    # Django ValidationError
    # --------------------------------------------------------

    if isinstance(
        exc,
        DjangoValidationError,
    ):
        errors = _normalize_django_validation_error(
            exc,
        )

        return Response(
            {
                "success": False,
                "data": None,
                "message": "درخواست نامعتبر است.",
                "errors": errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --------------------------------------------------------
    # DRF Exception
    # --------------------------------------------------------

    response = exception_handler(
        exc,
        context,
    )

    if response is not None:
        if isinstance(
            exc,
            DRFValidationError,
        ):
            message = "درخواست نامعتبر است."
        else:
            message = "خطایی در پردازش درخواست رخ داد."

        existing_data = response.data

        if isinstance(existing_data, dict):
            errors = existing_data
        else:
            errors = {
                "detail": existing_data,
            }

        response.data = {
            "success": False,
            "data": None,
            "message": message,
            "errors": errors,
        }

        return response

    # --------------------------------------------------------
    # Unexpected server error
    # --------------------------------------------------------

    logger.exception(
        "Unhandled exception",
        exc_info=exc,
    )

    return Response(
        {
            "success": False,
            "data": None,
            "message": "خطای داخلی سرور رخ داده است.",
            "errors": None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )