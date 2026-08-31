from django.core.exceptions import ValidationError
from django.db import transaction


class ReversalService:
    @staticmethod
    @transaction.atomic
    def ensure_not_reversed(transaction):
        if transaction.reversal_transactions.exists():
            raise ValidationError(
                "این تراکنش قبلاً معکوس شده است."
            )