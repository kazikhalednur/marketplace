from rest_framework import serializers

from ..models import User


class PasswordChangeSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(max_length=128, write_only=True, required=True)
    new_password = serializers.CharField(max_length=128, write_only=True, required=True)
    confirm_password = serializers.CharField(
        max_length=128, write_only=True, required=True
    )

    class Meta:
        model = User
        fields = ["old_password", "new_password", "confirm_password"]

    def validate(self, attrs):
        if not self.context["request"].user.check_password(attrs["old_password"]):
            raise serializers.ValidationError({"old_password": "Wrong password"})

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Password does not match"}
            )

        return attrs

    def save(self, **kwargs):
        user: User = self.instance
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
