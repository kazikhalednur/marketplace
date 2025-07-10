from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from ..models import User


class SigninSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

        self.fields[self.username_field] = serializers.EmailField()

    def validate(self, attrs: dict[str, str]) -> dict[str, str]:
        email = attrs.get(self.username_field)
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "User with this email does not exist."}
            )
        if not user.email_verified:
            raise serializers.ValidationError(
                {"detail": "Email is not verified. Please verify your email."}
            )

        if not user.check_password(password):
            raise serializers.ValidationError({"detail": "Invalid password."})

        return super().validate(attrs)
