from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from ...models import Contract


class ClientContractListSerializer(ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)

    class Meta:
        model = Contract
        fields = (
            "id",
            "job_title",
            "budget",
            "status",
        )
