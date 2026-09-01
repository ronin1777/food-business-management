from rest_framework_simplejwt.authentication import (
    JWTAuthentication,
)
from rest_framework_simplejwt.exceptions import (
    InvalidToken,
    TokenError,
)


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