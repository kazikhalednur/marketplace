from rest_framework import serializers
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer as JWTTokenObtainPairSerializer,
)

from ..helpers import google_user_details
from ..models import User


class SigninGoogleSerializer(JWTTokenObtainPairSerializer):
    code = serializers.CharField(max_length=500, write_only=True)
    refresh = serializers.CharField(max_length=500, read_only=True)
    access = serializers.CharField(max_length=500, read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop("email", None)
        self.fields.pop("password", None)

    def validate(self, attrs):
        code = attrs["code"]

        google_data = google_user_details(code)

        user = User.objects.filter(email=google_data["email"], sub=google_data["sub"])

        if not user.exists():
            raise serializers.ValidationError({"email": "Invalid User"})

        refresh = self.get_token(user)

        attrs["refresh"] = str(refresh)
        attrs["access"] = str(refresh.access_token)

        return attrs
