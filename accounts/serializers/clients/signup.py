from rest_framework import serializers

from ...mails import send_signup_verification_email
from ...models import Client, ClientProfile


class ClientSignupSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(max_length=128, write_only=True)
    company_name = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        help_text="Your company name, if applicable",
        write_only=True,
    )

    class Meta:
        model = Client
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "username",
            "password",
            "confirm_password",
            "company_name",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Password doesn't matched"})
        attrs.pop("confirm_password")

        return attrs

    def create(self, validated_data):
        company_name = validated_data.pop("company_name", "")
        instance = Client.objects.create_user(**validated_data, is_active=False)
        ClientProfile.objects.create(client=instance, company_name=company_name)
        send_signup_verification_email(instance, self.context["request"])
        return instance
