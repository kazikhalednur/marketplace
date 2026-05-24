import os

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Attachment, Proposal
from .services import process_proposal_acceptance


@receiver(pre_save, sender=Proposal)
def cache_proposal_status_before_save(sender, instance: Proposal, **kwargs):
    if instance.pk:
        instance._previous_status = (
            Proposal.objects.filter(pk=instance.pk)
            .values_list("status", flat=True)
            .first()
        )
    else:
        instance._previous_status = None


@receiver(post_save, sender=Proposal)
def create_contract_on_proposal_acceptance(sender, instance: Proposal, **kwargs):
    if instance.status != Proposal.BidStatus.ACCEPTED:
        return

    previous_status = getattr(instance, "_previous_status", None)
    if previous_status == Proposal.BidStatus.ACCEPTED:
        return

    process_proposal_acceptance(instance)


@receiver(pre_save, sender=Attachment)
def delete_old_file_on_change(sender, instance, **kwargs):
    if not instance.pk:
        # New file, nothing to delete
        return

    try:
        old_instance = Attachment.objects.get(pk=instance.pk)
    except Attachment.DoesNotExist:
        return

    old_file = old_instance.file
    new_file = instance.file

    # Delete old file if the file has changed
    if old_file and old_file != new_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)
