from rest_framework_simplejwt.authentication import (
    JWTAuthentication,
)
from rest_framework_simplejwt.exceptions import (
    InvalidToken,
    TokenError,
)
from rest_framework_simplejwt.authentication import JWTAuthentication




class CookieJWTAuthentication(
    JWTAuthentication,
):
    access_cookie_name = "access_token"

    def authenticate(
        self,
        request,
    ):
        raw_token = request.COOKIES.get(
            self.access_cookie_name,
        )

        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(
                raw_token,
            )
        except (
            InvalidToken,
            TokenError,
        ):
            return None

        return (
            self.get_user(validated_token),
            validated_token,
        )


class CookieOrBearerJWTAuthentication(
    JWTAuthentication,
):
    """
    Supports both:
    - Web: JWT from HttpOnly cookie
    - Mobile: JWT from Authorization: Bearer <token>
    """

    access_cookie_name = "access_token"

    def authenticate(self, request):
        # 1. Try web cookie authentication.
        raw_token = request.COOKIES.get(
            self.access_cookie_name,
        )

        if raw_token:
            try:
                validated_token = self.get_validated_token(
                    raw_token,
                )
            except (
                InvalidToken,
                TokenError,
            ):
                pass
            else:
                return (
                    self.get_user(validated_token),
                    validated_token,
                )

        # 2. If there is no valid cookie,
        #    try Authorization: Bearer <token>.
        return super().authenticate(request)