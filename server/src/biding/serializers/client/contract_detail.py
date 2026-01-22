from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from accounts.models import FreelancerProfile
from base.models import Settings as base_settings
from jobs.models import Job

from ...models import Contract


class ClientContractJobSerializer(ModelSerializer):
    job_link = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Job
        fields = ("id", "title", "description", "job_link")

    @extend_schema_field(serializers.URLField)
    def get_job_link(self, obj):
        frontend_url = base_settings.FRONTEND_URL
        return f"{frontend_url}/dashboard?jobId={obj.id}/"


class ClientContractFreelancerProfileSerializer(ModelSerializer):
    username = serializers.CharField(source="freelancer.username", read_only=True)
    full_name = serializers.CharField(source="freelancer.get_full_name", read_only=True)

    class Meta:
        model = FreelancerProfile
        fields = (
            "username",
            "avatar",
            "full_name",
        )


class ClientContractDetailSerializer(ModelSerializer):
    job = ClientContractJobSerializer(read_only=True)
    freelancer_profile = ClientContractFreelancerProfileSerializer(read_only=True)

    class Meta:
        model = Contract
        fields = (
            "id",
            "job",
            "freelancer_profile",
            "status",
            "start_date",
            "end_date",
            "budget",
        )
        read_only_fields = (
            "id",
            "start_date",
            "budget",
        )
