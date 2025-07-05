from rest_framework import serializers

from ...helpers import match_email_domain
from ...mails import send_signup_verification_email
from ...models import Freelancer


class SignupSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(max_length=128, write_only=True)

    class Meta:
        model = Freelancer
        fields = [
            "email",
            "username",
            "password",
            "password2",
        ]

    def validate(self, attrs):
        if not match_email_domain(attrs["email"]):
            raise serializers.ValidationError(
                {"email": "Try with your varsity mail address"}
            )

        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Password doesn't matched"})
        attrs.pop("password2")

        return attrs

    def create(self, validated_data):
        instance = Freelancer.objects.create_user(**validated_data, is_active=False)
        send_signup_verification_email(instance, self.context["request"])
        return instance
