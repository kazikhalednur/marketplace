from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class SigninSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        data["role"] = self.user.role

        return data

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

        self.fields[self.username_field] = serializers.EmailField()
