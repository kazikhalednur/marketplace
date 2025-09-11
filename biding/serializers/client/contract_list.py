from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from base.models import Settings as base_settings
from jobs.models import Job

from ...models import Contract


class ClientContractJobSerializer(ModelSerializer):
    job_link = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Job
        fields = ("id", "title", "job_link")

    @extend_schema_field(serializers.URLField)
    def get_job_link(self, obj):
        frontend_url = base_settings.FRONTEND_URL
        return f"{frontend_url}/dashboard?jobId={obj.id}/"


class ClientContractListSerializer(ModelSerializer):
    job = ClientContractJobSerializer(read_only=True)

    class Meta:
        model = Contract
        fields = (
            "id",
            "job",
            "budget",
            "status",
        )
