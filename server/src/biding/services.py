from django.db import transaction

from jobs.models import Job
from notifications.models import Notification

from .models import Contract, Proposal


def process_proposal_acceptance(proposal: Proposal) -> Contract | None:
    """
    Create a contract and run related side effects when a proposal is accepted.

    Idempotent: no-op if a contract already exists for this proposal.
    """
    if Contract.objects.filter(proposal_id=proposal.pk).exists():
        return None

    proposal = (
        Proposal.objects.select_related(
            "job",
            "job__created_by__client_profile",
            "freelancer_sub_profile__freelancer_profile__freelancer",
        )
        .get(pk=proposal.pk)
    )

    with transaction.atomic():
        contract = Contract.objects.create(
            freelancer_profile=proposal.freelancer_sub_profile.freelancer_profile,
            freelancer_sub_profile=proposal.freelancer_sub_profile,
            client_profile=proposal.job.created_by.client_profile,
            proposal=proposal,
            job=proposal.job,
            budget=proposal.bid_amount,
        )

        proposal.job.status = Job.JobStatus.IN_PROGRESS
        proposal.job.save(update_fields=["status"])

        freelancer_user = (
            proposal.freelancer_sub_profile.freelancer_profile.freelancer
        )
        Notification.objects.create(
            user=freelancer_user,
            message=f"Your proposal for {proposal.job.title} has been accepted.",
            message_type=Notification.NotificationType.SUCCESS,
        )
        Notification.objects.create(
            user=freelancer_user,
            message="You can chat with the client now.",
            message_type=Notification.NotificationType.INFO,
        )

        closed_proposals = Proposal.objects.filter(job=proposal.job).exclude(
            id=proposal.id
        )
        closed_proposals.update(status=Proposal.BidStatus.CLOSED)
        for closed in closed_proposals.select_related(
            "freelancer_sub_profile__freelancer_profile__freelancer"
        ):
            Notification.objects.create(
                user=closed.freelancer_sub_profile.freelancer_profile.freelancer,
                message=f"Your proposal for {closed.job.title} has been closed.",
                message_type=Notification.NotificationType.INFO,
            )

    return contract
