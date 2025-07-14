from rest_framework import serializers

from accounts.serializers.freelancers.sub_profile import FreelancerSubProfileSerializer

from ...models import Proposal
from .attachment import ClientAttachmentSerializer


class ClientProposalSerializer(serializers.ModelSerializer):
    freelancer_profile = FreelancerSubProfileSerializer(
        read_only=True, source="freelancer_sub_profile"
    )
    attachments = ClientAttachmentSerializer(
        many=True, read_only=True, source="attachments.all"
    )

    class Meta:
        model = Proposal
        fields = (
            "id",
            "freelancer_profile",
            "cover_letter",
            "attachments",
            "bid_amount",
            "status",
            "submitted_at",
        )
        read_only_fields = (
            "id",
            "freelancer_profile",
            "cover_letter",
            "bid_amount",
            "submitted_at",
        )
