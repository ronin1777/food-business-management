from rest_framework import serializers


class ReportPeriodSerializer(
    serializers.Serializer,
):
    date_from = serializers.DateField(
        required=False,
    )

    date_to = serializers.DateField(
        required=False,
    )

    def validate(self, attrs):
        date_from = attrs.get("date_from")
        date_to = attrs.get("date_to")

        if (
            date_from is not None
            and date_to is not None
            and date_from > date_to
        ):
            raise serializers.ValidationError(
                {
                    "date_from": (
                        "تاریخ شروع نمی‌تواند "
                        "بعد از تاریخ پایان باشد."
                    )
                }
            )

        return attrs