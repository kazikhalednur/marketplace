import uuid

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import (
    Client,
    Freelancer,
    FreelancerProfile,
    FreelancerSubProfile,
    User,
    WebSocketID,
)


@receiver(post_save, sender=User)
def create_user_websocket_id(sender, instance, created, **kwargs):
    """
    Generate a unique WebSocket ID when a new user is created.
    This handles User, Freelancer, and Client since they are proxy models.
    """
    if created:
        websocket_id = str(uuid.uuid4()).replace("-", "").upper()
        WebSocketID.objects.create(user=instance, notification_id=websocket_id)


@receiver(post_save, sender=Freelancer)
def create_user_websocket_id(sender, instance, created, **kwargs):
    """
    Generate a unique WebSocket ID when a new user is created.
    This handles User, Freelancer, and Client since they are proxy models.
    """
    if created:
        websocket_id = str(uuid.uuid4()).replace("-", "").upper()
        WebSocketID.objects.create(user=instance, notification_id=websocket_id)


@receiver(post_save, sender=Client)
def create_user_websocket_id(sender, instance, created, **kwargs):
    """
    Generate a unique WebSocket ID when a new user is created.
    This handles User, Freelancer, and Client since they are proxy models.
    """
    if created:
        websocket_id = str(uuid.uuid4()).replace("-", "").upper()
        WebSocketID.objects.create(user=instance, notification_id=websocket_id)


@receiver(post_save, sender=FreelancerProfile)
def create_freelancer_sub_profile(sender, instance, created, **kwargs):
    """
    Automatically create a FreelancerSubProfile when a FreelancerProfile is created
    """
    if created:
        # Create a default FreelancerSubProfile for the new freelancer
        FreelancerSubProfile.objects.create(freelancer_profile=instance)


@receiver(post_save, sender=FreelancerProfile)
def update_freelancer_sub_profile(sender, instance, created, **kwargs):
    """
    Ensure FreelancerSubProfile exists for existing FreelancerProfile
    """
    if not created:
        # Check if sub profile exists, if not create one
        if (
            not hasattr(instance, "freelancer_sub_profiles")
            or not instance.freelancer_sub_profiles.exists()
        ):
            FreelancerSubProfile.objects.create(freelancer_profile=instance)
