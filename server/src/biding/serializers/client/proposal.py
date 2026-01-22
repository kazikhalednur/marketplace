from django.db import transaction
from rest_framework import serializers

from accounts.serializers.freelancers.sub_profile import FreelancerSubProfileSerializer
from jobs.models import Job
from notifications.models import Notification

from ...models import Contract, Proposal
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

    def save(self, **kwargs):
        if self.instance and self.instance.status == Proposal.BidStatus.ACCEPTED:
            raise serializers.ValidationError(
                {"status": "Cannot modify an accepted proposal."}
            )
        proposal: Proposal = super().save(**kwargs)
        if proposal.status == Proposal.BidStatus.ACCEPTED:
            with transaction.atomic():
                proposal.job.status = Job.JobStatus.IN_PROGRESS
                proposal.job.save(update_fields=["status"])
                # Create a contract
                Contract.objects.create(
                    freelancer_profile=proposal.freelancer_sub_profile.freelancer_profile,  # noqa: E501
                    freelancer_sub_profile=proposal.freelancer_sub_profile,
                    client_profile=proposal.job.created_by.client_profile,
                    proposal=proposal,
                    job=proposal.job,
                    budget=proposal.bid_amount,
                )

                Notification.objects.create(
                    user=proposal.freelancer_sub_profile.freelancer_profile.freelancer,  # noqa: E501
                    message=f"Your proposal for {proposal.job.title} has been accepted.",  # noqa: E501
                    message_type=Notification.NotificationType.SUCCESS,
                )
                Notification.objects.create(
                    user=proposal.freelancer_sub_profile.freelancer_profile.freelancer,  # noqa: E501
                    message="You can chat with the client now.",
                    message_type=Notification.NotificationType.INFO,
                )
                # Notify other freelancers
                closed_proposal = Proposal.objects.filter(job=proposal.job).exclude(
                    id=proposal.id
                )
                closed_proposal.update(status=Proposal.BidStatus.CLOSED)
                for closed in closed_proposal:
                    Notification.objects.create(
                        user=closed.freelancer_sub_profile.freelancer_profile.freelancer,  # noqa: E501
                        message=f"Your proposal for {closed.job.title} has been closed.",  # noqa: E501
                        message_type=Notification.NotificationType.INFO,
                    )
        return proposal
