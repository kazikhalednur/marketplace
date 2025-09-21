from rest_framework import serializers

from ...helpers import match_email_domain
from ...models import Freelancer, FreelancerProfile
from ...tasks import send_signup_verification_email_task


class SignupSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(max_length=128, write_only=True)
    student_id = serializers.CharField(
        max_length=20,
        required=True,
        help_text="Your student ID, e.g., 2019-12345-1",
        write_only=True,
    )

    class Meta:
        model = Freelancer
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "username",
            "password",
            "confirm_password",
            "student_id",
        ]

    def validate(self, attrs):
        if not match_email_domain(attrs["email"]):
            raise serializers.ValidationError(
                {"email": "Try with your varsity mail address"}
            )

        if FreelancerProfile.objects.filter(student_id=attrs["student_id"]).exists():
            raise serializers.ValidationError(
                {"student_id": "This student ID is already registered"}
            )

        if Freelancer.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "Email already exists"})

        if Freelancer.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "Username already exists"})

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Password doesn't matched"})
        attrs.pop("confirm_password")

        return attrs

    def create(self, validated_data):
        student_id = validated_data.pop("student_id", "")
        instance = Freelancer.objects.create_user(**validated_data, is_active=False)
        FreelancerProfile.objects.create(freelancer=instance, student_id=student_id)
        send_signup_verification_email_task.delay(instance.id)
        return instance
