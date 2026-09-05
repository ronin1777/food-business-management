from django.urls import path

from .views import AuthViewSet


auth_view = AuthViewSet.as_view


urlpatterns = [
    path(
        "register/",
        auth_view({"post": "register"}),
        name="register",
    ),
    path(
        "login/",
        auth_view({"post": "login"}),
        name="login",
    ),
    path(
        "mobile/login/",
        auth_view(
            {
                "post": "mobile_login",
            }
        ),
        name="mobile-login",
    ),
    path(
        "mobile/refresh/",
        auth_view(
            {
                "post": "mobile_refresh",
            }
        ),
        name="mobile-refresh",
    ),
    path(
        "refresh/",
        auth_view({"post": "refresh"}),
        name="refresh",
    ),
    path(
        "logout/",
        auth_view({"post": "logout"}),
        name="logout",
    ),
    path(
        "me/",
        auth_view({"get": "me"}),
        name="me",
    ),
    path(
    "mobile/register/",
    auth_view(
        {
            "post": "mobile_register",
        }
    ),
    name="mobile-register",
),

path(
    "mobile/logout/",
    auth_view(
        {
            "post": "mobile_logout",
        }
    ),
    name="mobile-logout",
),
]