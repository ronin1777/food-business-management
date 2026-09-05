from django.contrib.auth import get_user_model
from django.db import transaction

from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.responses import APIResponse

from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


User = get_user_model()


class AuthViewSet(viewsets.GenericViewSet):
    def get_permissions(self):
        if self.action in {
            "register",
            "mobile_register",
            "login",
            "mobile_login",
            "mobile_refresh",
            "refresh",
            "logout",
            "mobile_logout",
        }:
            return [AllowAny()]

        return [IsAuthenticated()]

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

        return APIResponse.success(
            data={
                "user": {
                    "id": user.id,
                    "username": user.username,
                },
            },
            message=(
                "ثبت‌نام با موفقیت انجام شد. "
                "حساب کاربری شما پس از تأیید فعال خواهد شد."
            ),
            status_code=status.HTTP_201_CREATED,
        )

    def mobile_register(
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

        return APIResponse.success(
            data={
                "user": {
                    "id": user.id,
                    "username": user.username,
                },
            },
            message=(
                "ثبت‌نام با موفقیت انجام شد. "
                "حساب کاربری شما پس از تأیید فعال خواهد شد."
            ),
            status_code=status.HTTP_201_CREATED,
        )

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

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = User.objects.filter(
            username=username,
        ).first()

        # User does not exist or password is incorrect.
        if user is None or not user.check_password(password):
            return APIResponse.error(
                message="نام کاربری یا رمز عبور اشتباه است.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        # Password is correct, but account is inactive.
        if not user.is_active:
            return APIResponse.error(
                message="حساب کاربری غیرفعال است.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

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
            path="/",
        )

        return response

    def mobile_login(
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

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = User.objects.filter(
            username=username,
        ).first()

        # User does not exist or password is incorrect.
        if user is None or not user.check_password(password):
            return APIResponse.error(
                message="نام کاربری یا رمز عبور اشتباه است.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        # Password is correct, but account is inactive.
        if not user.is_active:
            return APIResponse.error(
                message="حساب کاربری غیرفعال است.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return APIResponse.success(
            data={
                "access": access_token,
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                },
            },
            message="ورود با موفقیت انجام شد.",
        )

    def mobile_refresh(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        refresh_token = request.data.get(
            "refresh",
        )

        if not refresh_token:
            return APIResponse.error(
                message="Refresh Token ارسال نشده است.",
                status_code=status.HTTP_400_BAD_REQUEST,
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
                message="Refresh Token نامعتبر یا منقضی شده است.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        return APIResponse.success(
            data={
                "access": access_token,
            },
            message="توکن دسترسی با موفقیت تمدید شد.",
        )

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
                status_code=status.HTTP_401_UNAUTHORIZED,
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
                message="Refresh Token نامعتبر یا منقضی شده است.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        response = APIResponse.success(
            data=None,
            message="توکن دسترسی با موفقیت تمدید شد.",
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

    def logout(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        refresh_token = request.COOKIES.get(
            "refresh_token",
        )

        if refresh_token:
            try:
                refresh = RefreshToken(
                    refresh_token,
                )
                refresh.blacklist()
            except TokenError:
                pass

        response = APIResponse.success(
            data=None,
            message="با موفقیت خارج شدید.",
        )

        response.delete_cookie(
            key="access_token",
            path="/",
        )

        response.delete_cookie(
            key="refresh_token",
            path="/api/auth/",
        )

        return response

    def mobile_logout(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        refresh_token = request.data.get(
            "refresh",
        )

        if refresh_token:
            try:
                refresh = RefreshToken(
                    refresh_token,
                )
                refresh.blacklist()
            except TokenError:
                pass

        return APIResponse.success(
            data=None,
            message="با موفقیت خارج شدید.",
        )

    def me(
        self,
        request: Request,
        *args,
        **kwargs,
    ) -> Response:
        serializer = UserSerializer(
            request.user,
        )

        return APIResponse.success(
            data={
                "user": serializer.data,
            },
        )