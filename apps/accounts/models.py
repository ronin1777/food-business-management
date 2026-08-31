from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom user model.

    Each user owns exactly one organization.
    Organization relation is defined on Organization model
    to keep the domain ownership explicit.
    """

    email = None

    def __str__(self):
        return self.username