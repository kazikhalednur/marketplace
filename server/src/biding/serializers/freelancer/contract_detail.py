from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from accounts.models import ClientProfile
from base.models import Settings as base_settings
from jobs.models import Job

from ...models import Contract


class ContractJobSerializer(ModelSerializer):
    job_link = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Job
        fields = ("id", "title", "job_link")

    @extend_schema_field(serializers.URLField)
    def get_job_link(self, obj):
        frontend_url = base_settings.FRONTEND_URL
        return f"{frontend_url}/dashboard?jobId={obj.id}/"


class ContractClientProfileSerializer(ModelSerializer):
    username = serializers.CharField(source="client.username", read_only=True)
    first_name = serializers.CharField(source="client.first_name", read_only=True)
    last_name = serializers.CharField(source="client.last_name", read_only=True)

    class Meta:
        model = ClientProfile
        fields = (
            "username",
            "avatar",
            "first_name",
            "last_name",
        )


class ContractDetailSerializer(ModelSerializer):
    job = ContractJobSerializer(read_only=True)
    client_profile = ContractClientProfileSerializer(read_only=True)

    class Meta:
        model = Contract
        fields = (
            "id",
            "job",
            "client_profile",
            "budget",
            "status",
            "start_date",
            "end_date",
        )
