from rest_framework import serializers

from ...models import User
from .sub_profile import FreelancerSubProfileSerializer


class UserInfoSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    role = serializers.CharField(read_only=True)
    email_verified = serializers.BooleanField(read_only=True)
    is_google_login = serializers.BooleanField(read_only=True)
    student_id = serializers.CharField(
        source="freelancer_profile.student_id", read_only=True
    )
    is_available = serializers.BooleanField(source="freelancer_profile.is_available")
    freelancer_sub_profiles = FreelancerSubProfileSerializer(
        source="freelancer_profile.freelancer_sub_profiles",
        many=True,
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
            "student_id",
            "is_available",
            "freelancer_sub_profiles",
        ]

    def update(self, instance, validated_data):
        # Update the user instance with the provided data
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.username = validated_data.get("username", instance.username)
        instance.phone = validated_data.get("phone", instance.phone)

        # Save the updated user instance
        instance.save()

        # Nested freelancer_sub_profiles update
        freelancer_data = validated_data.get("freelancer_profile", {})
        sub_profiles_data = freelancer_data.get("freelancer_sub_profiles", [])

        if sub_profiles_data:
            freelancer_profile = instance.freelancer_profile
            existing_profiles = {
                sub.id: sub for sub in freelancer_profile.freelancer_sub_profiles.all()
            }
            updated_ids = []

            for sub_data in sub_profiles_data:
                sub_id = sub_data.get("id")
                if sub_id and sub_id in existing_profiles:
                    sub_instance = existing_profiles[sub_id]
                    serializer = FreelancerSubProfileSerializer(
                        instance=sub_instance, data=sub_data, partial=True
                    )
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    updated_ids.append(sub_id)
                else:
                    serializer = FreelancerSubProfileSerializer(data=sub_data)
                    serializer.is_valid(raise_exception=True)
                    serializer.save(freelancer_profile=freelancer_profile)

            # Optionally delete profiles not updated
            for existing_id in existing_profiles:
                if existing_id not in updated_ids:
                    existing_profiles[existing_id].delete()

        return instance
