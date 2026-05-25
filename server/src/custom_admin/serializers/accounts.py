from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from accounts.models import (
    Arbitrator,
    Auditor,
    Client,
    ClientProfile,
    Education,
    Experience,
    Freelancer,
    FreelancerProfile,
    FreelancerSubProfile,
    Project,
    User,
)
from custom_admin.serializers.base import AdminModelSerializer


class UserAdminListSerializer(AdminModelSerializer):
    """Serializer for User list view - lightweight without nested data."""

    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = "__all__"
        read_only_fields = ("id", "date_joined", "last_login")
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ClientProfileAdminSerializer(AdminModelSerializer):
    class Meta:
        model = ClientProfile
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class FreelancerProfileAdminSerializer(AdminModelSerializer):
    class Meta:
        model = FreelancerProfile
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class FreelancerSubProfileAdminSerializer(AdminModelSerializer):
    class Meta:
        model = FreelancerSubProfile
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class ProjectAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class EducationAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Education
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class ExperienceAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Experience
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class UserAdminDetailSerializer(AdminModelSerializer):
    """Serializer for User detail view - includes all nested related data."""

    password = serializers.CharField(write_only=True, required=False)

    # Nested serializers for related data
    client_profile = serializers.SerializerMethodField()
    freelancer_profile = serializers.SerializerMethodField()
    projects = serializers.SerializerMethodField()
    education = serializers.SerializerMethodField()
    experience = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = "__all__"
        read_only_fields = ("id", "date_joined", "last_login")
        extra_kwargs = {
            "password": {"write_only": True},
        }

    @extend_schema_field(ClientProfileAdminSerializer(allow_null=True))
    def get_client_profile(self, obj):
        """Get client profile if user is a client."""
        if obj.role == "client" and hasattr(obj, "client_profile"):
            return ClientProfileAdminSerializer(obj.client_profile).data
        return None

    @extend_schema_field(FreelancerProfileAdminSerializer(allow_null=True))
    def get_freelancer_profile(self, obj):
        """Get freelancer profile if user is a freelancer."""
        if obj.role == "freelancer" and hasattr(obj, "freelancer_profile"):
            profile_data = FreelancerProfileAdminSerializer(obj.freelancer_profile).data
            # Include sub-profiles
            if hasattr(obj.freelancer_profile, "freelancer_sub_profiles"):
                sub_profiles = obj.freelancer_profile.freelancer_sub_profiles.all()
                profile_data["sub_profiles"] = FreelancerSubProfileAdminSerializer(
                    sub_profiles, many=True
                ).data
            return profile_data
        return None

    @extend_schema_field(ProjectAdminSerializer(many=True))
    def get_projects(self, obj):
        """Get all projects for freelancers."""
        if obj.role == "freelancer" and hasattr(obj, "freelancer_profile"):
            # Get projects from all sub-profiles
            projects = []
            if hasattr(obj.freelancer_profile, "freelancer_sub_profiles"):
                for sub_profile in obj.freelancer_profile.freelancer_sub_profiles.all():
                    if hasattr(sub_profile, "projects"):
                        projects.extend(sub_profile.projects.all())
            return ProjectAdminSerializer(projects, many=True).data
        return []

    @extend_schema_field(EducationAdminSerializer(many=True))
    def get_education(self, obj):
        """Get all education records for freelancers."""
        if obj.role == "freelancer" and hasattr(obj, "freelancer_profile"):
            education_records = []
            if hasattr(obj.freelancer_profile, "freelancer_sub_profiles"):
                for sub_profile in obj.freelancer_profile.freelancer_sub_profiles.all():
                    if hasattr(sub_profile, "educations"):
                        education_records.extend(sub_profile.educations.all())
            return EducationAdminSerializer(education_records, many=True).data
        return []

    @extend_schema_field(ExperienceAdminSerializer(many=True))
    def get_experience(self, obj):
        """Get all experience records for freelancers."""
        if obj.role == "freelancer" and hasattr(obj, "freelancer_profile"):
            experience_records = []
            if hasattr(obj.freelancer_profile, "freelancer_sub_profiles"):
                for sub_profile in obj.freelancer_profile.freelancer_sub_profiles.all():
                    if hasattr(sub_profile, "experiences"):
                        experience_records.extend(sub_profile.experiences.all())
            return ExperienceAdminSerializer(experience_records, many=True).data
        return []

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


# Keep the original for backward compatibility
UserAdminSerializer = UserAdminListSerializer


class ClientAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"
        read_only_fields = ("id", "date_joined", "last_login")


class FreelancerAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Freelancer
        fields = "__all__"
        read_only_fields = ("id", "date_joined", "last_login")


class ArbitratorAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Arbitrator
        fields = "__all__"
        read_only_fields = ("id", "date_joined", "last_login")


class AuditorAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Auditor
        fields = "__all__"
        read_only_fields = ("id", "date_joined", "last_login")
