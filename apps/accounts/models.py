from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom user model for the application.

    Each user owns exactly one organization.
    """

    def __str__(self) -> str:
        return self.username