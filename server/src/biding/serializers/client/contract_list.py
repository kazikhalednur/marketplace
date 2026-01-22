from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from accounts.models import FreelancerProfile

from ...models import Contract


class FreelancerProfileSerializer(ModelSerializer):
    full_name = serializers.CharField(source="freelancer.get_full_name", read_only=True)
    username = serializers.CharField(source="freelancer.username", read_only=True)

    class Meta:
        model = FreelancerProfile
        fields = ("full_name", "username")


class ClientContractListSerializer(ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    job_description = serializers.CharField(source="job.description", read_only=True)
    freelancer_profile = FreelancerProfileSerializer(read_only=True)
    is_fixed = serializers.BooleanField(source="job.is_fixed", read_only=True)

    class Meta:
        model = Contract
        fields = (
            "id",
            "job_title",
            "job_description",
            "freelancer_profile",
            "start_date",
            "end_date",
            "is_fixed",
            "budget",
            "status",
        )
