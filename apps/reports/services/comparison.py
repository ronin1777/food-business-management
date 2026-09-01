from decimal import Decimal
from typing import Any


class ReportComparisonService:
    @staticmethod
    def compare(
        *,
        current: Decimal,
        previous: Decimal,
    ) -> dict[str, Any]:
        current = Decimal(str(current))
        previous = Decimal(str(previous))

        if previous == Decimal("0"):
            percentage_change = (
                Decimal("0")
                if current == Decimal("0")
                else None
            )
        else:
            percentage_change = (
                (
                    (current - previous)
                    / previous
                )
                * Decimal("100")
            )

        if current > previous:
            direction = "up"
        elif current < previous:
            direction = "down"
        else:
            direction = "unchanged"

        return {
            "current": current,
            "previous": previous,
            "percentage_change": percentage_change,
            "direction": direction,
        }

    @staticmethod
    def compare_metrics(
        *,
        current: dict[str, Decimal],
        previous: dict[str, Decimal],
    ) -> dict[str, dict[str, Any]]:
        metrics: dict[str, dict[str, Any]] = {}

        for name, current_value in current.items():
            previous_value = (
                previous.get(
                    name,
                    Decimal("0"),
                )
            )

            metrics[name] = (
                ReportComparisonService.compare(
                    current=current_value,
                    previous=previous_value,
                )
            )

        return metrics