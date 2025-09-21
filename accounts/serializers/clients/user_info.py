from rest_framework import serializers

from ...models import User


class ClientUserInfoSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    role = serializers.CharField(read_only=True)
    email_verified = serializers.BooleanField(read_only=True)
    is_google_login = serializers.BooleanField(read_only=True)
    company_name = serializers.CharField(
        source="client_profile.company_name",
        allow_null=True,
        required=False,
        allow_blank=True,
    )
    twitter = serializers.URLField(
        source="client_profile.twitter",
        allow_null=True,
        required=False,
        allow_blank=True,
    )
    linkedin = serializers.URLField(
        source="client_profile.linkedin",
        allow_null=True,
        required=False,
        allow_blank=True,
    )
    bio = serializers.CharField(
        source="client_profile.bio", allow_null=True, required=False, allow_blank=True
    )
    avatar = serializers.URLField(
        source="client_profile.avatar", allow_null=True, required=False
    )
    is_payment_verified = serializers.BooleanField(
        source="client_profile.is_payment_verified", read_only=True
    )
    is_phone_verified = serializers.BooleanField(
        source="client_profile.is_phone_verified", read_only=True
    )
    notification_id = serializers.CharField(
        source="websocket.notification_id", read_only=True
    )

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
            "company_name",
            "twitter",
            "linkedin",
            "bio",
            "avatar",
            "is_payment_verified",
            "is_phone_verified",
            "notification_id",
        ]
        extra_kwargs = {"email": {"read_only": True}, "role": {"read_only": True}}

    def update(self, instance, validated_data):
        # Extract client_profile data
        client_profile_data = validated_data.pop("client_profile", {})

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update client profile fields
        client_profile = instance.client_profile  # assumes OneToOneField
        for attr, value in client_profile_data.items():
            setattr(client_profile, attr, value)
        client_profile.save()

        return instance
