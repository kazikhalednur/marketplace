from rest_framework import serializers

from ..models import User


class UserInfoSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    role = serializers.CharField(read_only=True)
    email_verified = serializers.BooleanField(read_only=True)
    is_google_login = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "username",
            "phone",
            "role",
            "email_verified",
            "is_google_login",
        ]
