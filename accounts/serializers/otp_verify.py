from rest_framework import serializers

from ..models import OTP, User


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True, required=True)
    code = serializers.CharField(max_length=6, write_only=True, required=True)

    def validate(self, attrs):
        if not User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "User Doesn't Exists"})

        user = User.objects.get(email=attrs["email"])

        if not OTP.objects.filter(user=user, code=attrs["code"]).exists():
            raise serializers.ValidationError({"code": "Invalid OTP"})

        if OTP.objects.get(user=user, code=attrs["code"]).is_expired():
            raise serializers.ValidationError({"code": "OTP is expired"})

        return attrs

    def save(self, **kwargs):
        return
