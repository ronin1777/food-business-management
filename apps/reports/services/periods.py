from datetime import date, timedelta

from django.core.exceptions import ValidationError


class ReportPeriodService:
    @staticmethod
    def validate_period(
        *,
        date_from: date,
        date_to: date,
    ) -> None:
        if date_from > date_to:
            raise ValidationError(
                {
                    "date_from": (
                        "تاریخ شروع نمی‌تواند "
                        "بعد از تاریخ پایان باشد."
                    )
                }
            )

    @staticmethod
    def get_previous_period(
        *,
        date_from: date,
        date_to: date,
    ) -> tuple[date, date]:
        ReportPeriodService.validate_period(
            date_from=date_from,
            date_to=date_to,
        )

        period_days = (
            date_to - date_from
        ).days + 1

        previous_date_to = (
            date_from - timedelta(days=1)
        )

        previous_date_from = (
            previous_date_to
            - timedelta(days=period_days - 1)
        )

        return (
            previous_date_from,
            previous_date_to,
        )

    @staticmethod
    def get_periods(
        *,
        date_from: date,
        date_to: date,
    ) -> dict[str, dict[str, date]]:
        previous_date_from, previous_date_to = (
            ReportPeriodService.get_previous_period(
                date_from=date_from,
                date_to=date_to,
            )
        )

        return {
            "current": {
                "date_from": date_from,
                "date_to": date_to,
            },
            "previous": {
                "date_from": previous_date_from,
                "date_to": previous_date_to,
            },
        }

    @staticmethod
    def calculate_change(
        *,
        current: int | float,
        previous: int | float,
    ) -> dict[str, int | float | None]:
        if previous == 0:
            percentage = (
                None
                if current != 0
                else 0
            )
        else:
            percentage = (
                (current - previous)
                / previous
            ) * 100

        return {
            "current": current,
            "previous": previous,
            "percentage": percentage,
        }




