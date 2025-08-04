from django.db.models.signals import post_save
from django.dispatch import receiver

from biding.models import Contract

from .models import Conversation


@receiver(post_save, sender=Contract)
def create_conversation_on_contract_creation(sender, instance, created, **kwargs):
    if created:
        # Only create conversation if one doesn't already exist
        if not hasattr(instance, "conversation"):
            Conversation.objects.create(contract=instance)
