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
    avatar = serializers.URLField(
        source="freelancer_profile.avatar", allow_null=True, required=False
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
            "student_id",
            "is_available",
            "avatar",
            "notification_id",
            "freelancer_sub_profiles",
        ]

    def update(self, instance, validated_data):
        freelancer_data = validated_data.get("freelancer_profile", {})

        # Update freelancer_profile fields except freelancer_sub_profiles
        freelancer_profile = instance.freelancer_profile
        for attr, value in freelancer_data.items():
            if attr == "freelancer_sub_profiles":
                continue
            setattr(freelancer_profile, attr, value)
        freelancer_profile.save()

        # Update the user instance fields
        for attr, value in validated_data.items():
            if attr == "freelancer_profile":
                continue
            setattr(instance, attr, value)
        instance.save()

        # Handle freelancer_sub_profiles update
        sub_profiles_data = freelancer_data.get("freelancer_sub_profiles", [])
        if sub_profiles_data:
            existing_profiles = {
                sub.id: sub for sub in freelancer_profile.freelancer_sub_profiles.all()
            }
            updated_ids = []

            for sub_data in sub_profiles_data:
                sub_id = sub_data.get("id")
                if sub_id and sub_id in existing_profiles:
                    sub_instance = existing_profiles[sub_id]
                    skills_data = sub_data.pop("skills", [])
                    if skills_data:
                        skills_ids = [skill.id for skill in skills_data]
                        sub_data["skills"] = skills_ids
                    serializer = FreelancerSubProfileSerializer(
                        instance=sub_instance,
                        data=sub_data,
                        partial=True,
                        context=self.context,
                    )
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    updated_ids.append(sub_id)
                else:
                    skills_data = sub_data.pop("skills", [])
                    if skills_data:
                        skills_ids = [skill.id for skill in skills_data]
                        sub_data["skills"] = skills_ids
                    serializer = FreelancerSubProfileSerializer(
                        data=sub_data, context=self.context
                    )
                    serializer.is_valid(raise_exception=True)
                    serializer.save(freelancer_profile=freelancer_profile)

            # Optionally delete profiles not updated
            for existing_id in existing_profiles:
                if existing_id not in updated_ids:
                    existing_profiles[existing_id].delete()

        return instance
