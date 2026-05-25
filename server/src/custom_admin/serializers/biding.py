from biding.models import Attachment, Contract, Proposal
from custom_admin.serializers.base import AdminModelSerializer
from drf_spectacular.utils import extend_schema_serializer


class ProposalAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Proposal
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class ContractAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Contract
        fields = "__all__"
        read_only_fields = ("id", "start_date")


@extend_schema_serializer(component_name="BidingAttachmentAdmin")
class AttachmentAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Attachment
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
