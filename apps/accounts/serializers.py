from django.contrib.auth import get_user_model

from rest_framework import serializers

from apps.organizations.models import Organization


User = get_user_model()


class RegisterSerializer(
    serializers.Serializer,
):
    username = serializers.CharField(
        max_length=150,
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={
            "input_type": "password",
        },
    )

    organization_name = serializers.CharField(
        max_length=150,
    )

    def validate_username(
        self,
        value: str,
    ) -> str:
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "نام کاربری نمی‌تواند خالی باشد."
            )

        if User.objects.filter(
            username=value,
        ).exists():
            raise serializers.ValidationError(
                "این نام کاربری قبلاً استفاده شده است."
            )

        return value

    def validate_organization_name(
        self,
        value: str,
    ) -> str:
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "نام سازمان نمی‌تواند خالی باشد."
            )

        return value

    def create(
        self,
        validated_data,
    ):
        username = validated_data["username"]
        password = validated_data["password"]
        organization_name = validated_data[
            "organization_name"
        ]

        user = User.objects.create_user(
            username=username,
            password=password,
        )

        Organization.objects.create(
            name=organization_name,
            owner=user,
        )

        return user


class LoginSerializer(
    serializers.Serializer,
):
    username = serializers.CharField()

    password = serializers.CharField(
        write_only=True,
        style={
            "input_type": "password",
        },
    )


class UserSerializer(
    serializers.ModelSerializer,
):
    organization = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "organization",
        )
        read_only_fields = fields

    def get_organization(
        self,
        obj: User,
    ) -> dict[str, int | str]:
        organization = obj.organization

        return {
            "id": organization.id,
            "name": organization.name,
        }