from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from biding.models import Contract

from .models import Milestone, MilestoneStep, MilestoneStepSubmission


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


@receiver(post_save, sender=MilestoneStep)
def update_milestone_status_on_accept_milestone_step(
    sender, instance: MilestoneStep, created, **kwargs
):
    milestone = instance.milestone
    total_steps = milestone.steps.count()
    accepted_steps = milestone.steps.filter(
        status=MilestoneStep.Status.ACCEPTED
    ).count()

    # Always keep the number_of_steps in sync with related steps
    milestone.number_of_steps = total_steps

    # Determine milestone status
    if total_steps == 0:
        new_status = Milestone.Status.PENDING
    elif total_steps == accepted_steps:
        new_status = Milestone.Status.COMPLETED
    else:
        new_status = Milestone.Status.ACTIVE

    # Save only if there is any change to minimize writes
    update_fields = ["number_of_steps"]
    if milestone.status != new_status:
        milestone.status = new_status
        update_fields.append("status")

    milestone.save(update_fields=update_fields)
