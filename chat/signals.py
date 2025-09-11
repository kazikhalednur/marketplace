from django.db.models.signals import post_save
from django.dispatch import receiver

from biding.models import Contract

from .models import Conversation


@receiver(post_save, sender=Contract)
def create_conversation_on_contract_creation(sender, instance, created, **kwargs):
    if created:
        conversation = Conversation.objects.filter(
            freelancer_profile=instance.freelancer_profile,
            client_profile=instance.client_profile,
        ).first()
        if not conversation:
            Conversation.objects.create(
                freelancer_profile=instance.freelancer_profile,
                client_profile=instance.client_profile,
            )
