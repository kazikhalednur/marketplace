from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from biding.models import Contract

from .models import Milestone, MilestoneStepSubmission


@receiver(post_save, sender=Contract)
def create_milestone_on_contract_creation(sender, instance, created, **kwargs):
    if created:
        Milestone.objects.create(contract=instance)


@receiver(pre_save, sender=MilestoneStepSubmission)
def delete_old_file_on_change(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = MilestoneStepSubmission.objects.get(pk=instance.pk)
            if old_instance.code_zip != instance.code_zip:
                old_instance.code_zip.delete(save=False)
        except MilestoneStepSubmission.DoesNotExist:
            pass
    else:
        pass
