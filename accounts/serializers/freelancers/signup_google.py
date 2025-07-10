from django.utils.crypto import get_random_string
from rest_framework import serializers

from ...helpers import (
    google_user_details,
    match_email_domain,
)
from ...models import Freelancer


class SignupGoogleSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=500, write_only=True)

    def save(self, **kwargs):
        code = self.validated_data["code"]

        google_data = google_user_details(code)
        email = google_data["email"]
        username = email.split("@")[0]

        if not match_email_domain(email):
            raise serializers.ValidationError(
                {"email": "Try with your DIU email address"}
            )

        user = Freelancer.objects.create_user(
            sub=google_data["sub"],
            is_google_login=True,
            email=email,
            username=username,
            email_verified=google_data["email_verified"],
            password=get_random_string(32),
        )

        return user
