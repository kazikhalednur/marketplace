import uuid

from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models.profile.freelancer import FreelancerProfile
from .models.profile.sub.freelancer import FreelancerSubProfile
from .models.websocket_id import WebSocketID

User = get_user_model()


@receiver(post_save, sender=User)
def create_websocket_id(sender, instance, created, **kwargs):
    """
    Generate a unique WebSocket ID when a new user is created
    """
    if created:
        # Generate a unique WebSocket ID
        websocket_id = str(uuid.uuid4()).replace("-", "").upper()

        # Create WebSocketID instance for the new user
        WebSocketID.objects.create(user=instance, notification_id=websocket_id)

        print(f"Generated WebSocket ID {websocket_id} for user {instance.username}")


@receiver(post_save, sender=User)
def update_websocket_id(sender, instance, created, **kwargs):
    """
    Update WebSocket ID if user doesn't have one
    """
    if not created:
        # Check if user already has a WebSocket ID
        try:
            websocket_id_obj = instance.websocket
            if not websocket_id_obj.notification_id:
                websocket_id = str(uuid.uuid4()).replace("-", "").upper()
                websocket_id_obj.notification_id = websocket_id
                websocket_id_obj.save(update_fields=["notification_id"])
                print(
                    f"Updated WebSocket ID {websocket_id} for user {instance.username}"
                )
        except WebSocketID.DoesNotExist:
            # User doesn't have a WebSocketID instance, create one
            websocket_id = str(uuid.uuid4()).replace("-", "").upper()
            WebSocketID.objects.create(user=instance, notification_id=websocket_id)
            print(
                f"Created missing WebSocket ID {websocket_id} for user {instance.username}"  # noqa: E501
            )


@receiver(post_save, sender=FreelancerProfile)
def create_freelancer_sub_profile(sender, instance, created, **kwargs):
    """
    Automatically create a FreelancerSubProfile when a FreelancerProfile is created
    """
    if created:
        # Create a default FreelancerSubProfile for the new freelancer
        FreelancerSubProfile.objects.create(freelancer_profile=instance)
        print(f"Created FreelancerSubProfile for {instance.freelancer.username}")


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
            print(
                f"Created missing FreelancerSubProfile for {instance.freelancer.username}"  # noqa: E501
            )
