from django.contrib.auth import authenticate
from django.db import transaction

from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from rest_framework_simplejwt.exceptions import (
    TokenError,
)
from rest_framework_simplejwt.tokens import (
    RefreshToken,
)

from apps.core.responses import APIResponse

from .serializers import (
    LoginSerializer,
    RegisterSerializer,
)


class AuthViewSet(
    viewsets.GenericViewSet,
):
    permission_classes = [AllowAny]

    def register(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        serializer = RegisterSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        with transaction.atomic():
            user = serializer.save()

        refresh = RefreshToken.for_user(
            user,
        )

        access_token = str(
            refresh.access_token,
        )

        response = APIResponse.success(
            data={
                "user": {
                    "id": user.id,
                    "username": user.username,
                },
            },
            message="ثبت‌نام با موفقیت انجام شد.",
            status_code=status.HTTP_201_CREATED,
        )

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=15 * 60,
            path="/",
        )

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=7 * 24 * 60 * 60,
            path="/api/auth/",
        )

        return response

    def login(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        serializer = LoginSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        user = authenticate(
            request=request,
            username=serializer.validated_data[
                "username"
            ],
            password=serializer.validated_data[
                "password"
            ],
        )

        if user is None:
            return APIResponse.error(
                message=(
                    "نام کاربری یا رمز عبور "
                    "اشتباه است."
                ),
                status_code=(
                    status.HTTP_401_UNAUTHORIZED
                ),
            )

        if not user.is_active:
            return APIResponse.error(
                message="حساب کاربری غیرفعال است.",
                status_code=(
                    status.HTTP_401_UNAUTHORIZED
                ),
            )

        refresh = RefreshToken.for_user(
            user,
        )

        access_token = str(
            refresh.access_token,
        )

        response = APIResponse.success(
            data={
                "user": {
                    "id": user.id,
                    "username": user.username,
                },
            },
            message="ورود با موفقیت انجام شد.",
        )

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=15 * 60,
            path="/",
        )

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=7 * 24 * 60 * 60,
            path="/api/auth/",
        )

        return response

    def refresh(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        refresh_token = request.COOKIES.get(
            "refresh_token",
        )

        if not refresh_token:
            return APIResponse.error(
                message="Refresh Token یافت نشد.",
                status_code=(
                    status.HTTP_401_UNAUTHORIZED
                ),
            )

        try:
            refresh = RefreshToken(
                refresh_token,
            )

            access_token = str(
                refresh.access_token,
            )

        except TokenError:
            return APIResponse.error(
                message=(
                    "Refresh Token نامعتبر یا "
                    "منقضی شده است."
                ),
                status_code=(
                    status.HTTP_401_UNAUTHORIZED
                ),
            )

        response = APIResponse.success(
            data=None,
            message=(
                "توکن دسترسی با موفقیت تمدید شد."
            ),
        )

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=15 * 60,
            path="/",
        )

        return response