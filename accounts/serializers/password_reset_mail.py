from rest_framework import serializers

from ..models import User


class PasswordResetMailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        if not User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "User Doesn't Exists"})
        return attrs

    def get_user(self):
        return User.objects.get(email=self.validated_data["email"])
