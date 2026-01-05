from rest_framework.serializers import ModelSerializer

from ..models import Contract


class ContractSerializer(ModelSerializer):
    class Meta:
        model = Contract
        fields = (
            "id",
            "job",
            "freelancer_profile",
            "freelancer_sub_profile",
            "client_profile",
            "status",
            "start_date",
            "end_date",
        )
        read_only_fields = (
            "id",
            "start_date",
        )
