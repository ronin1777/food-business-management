from django.urls import path

from .views import AuthViewSet


auth_view = AuthViewSet.as_view


urlpatterns = [
    path(
        "register/",
        auth_view(
            {
                "post": "register",
            }
        ),
        name="register",
    ),

    path(
        "login/",
        auth_view(
            {
                "post": "login",
            }
        ),
        name="login",
    ),

    path(
        "refresh/",
        auth_view(
            {
                "post": "refresh",
            }
        ),
        name="refresh",
    ),
]