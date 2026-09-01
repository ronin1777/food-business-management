from rest_framework import serializers

from .models import Organization


class OrganizationSerializer(
    serializers.ModelSerializer,
):
    class Meta:
        model = Organization
        fields = (
            "id",
            "name",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "نام سازمان نمی‌تواند خالی باشد."
            )

        return value