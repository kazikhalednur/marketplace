from uuid import uuid4

from django.db import models

from accounts.models import ClientProfile, FreelancerProfile


class Conversation(models.Model):
    """
    Can be used for private or group chats.
    """

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        CLOSED = "closed", "Closed"
        ARCHIVED = "archived", "Archived"
        DELETED = "deleted", "Deleted"

    conversation_id = models.CharField(
        max_length=255, unique=True, blank=True, null=True
    )
    freelancer_profile: FreelancerProfile = models.ForeignKey(
        FreelancerProfile,
        related_name="conversations",
        on_delete=models.CASCADE,
    )
    client_profile: ClientProfile = models.ForeignKey(
        ClientProfile,
        related_name="conversations",
        on_delete=models.CASCADE,
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat {str(self.id)}"

    def save(self, *args, **kwargs):
        if not self.conversation_id:
            self.conversation_id = "".join(str(uuid4()).split("-")).upper()
        super().save(*args, **kwargs)


class Message(models.Model):
    """
    Stores messages sent in a conversation.
    """

    conversation: Conversation = models.ForeignKey(
        Conversation, related_name="messages", on_delete=models.CASCADE
    )
    freelancer_profile = models.ForeignKey(
        FreelancerProfile,
        related_name="sent_messages",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    client_profile = models.ForeignKey(
        ClientProfile,
        related_name="sent_messages",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    # Seen timestamps for freelancer and client
    seen_by_freelancer_at = models.DateTimeField(null=True, blank=True)
    seen_by_client_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Message {str(self.id)} by {self.freelancer_profile or self.client_profile} at {self.timestamp}"  # noqa: E501

    def save(self, *args, **kwargs):
        if not self.freelancer_profile and not self.client_profile:
            raise ValueError("Either freelancer_profile or client_profile must be set.")
        super().save(*args, **kwargs)

    def mark_as_seen_by_freelancer(self):
        """Mark message as seen by freelancer"""
        from django.utils import timezone

        self.seen_by_freelancer_at = timezone.now()
        self.save(update_fields=["seen_by_freelancer_at"])

    def mark_as_seen_by_client(self):
        """Mark message as seen by client"""
        from django.utils import timezone

        self.seen_by_client_at = timezone.now()
        self.save(update_fields=["seen_by_client_at"])

    def mark_as_read(self, user):
        """Mark message as read by user (freelancer or client)"""

        # Determine if user is freelancer or client
        try:
            FreelancerProfile.objects.get(freelancer=user)
            self.mark_as_seen_by_freelancer()
        except FreelancerProfile.DoesNotExist:
            try:
                ClientProfile.objects.get(client=user)
                self.mark_as_seen_by_client()
            except ClientProfile.DoesNotExist:
                raise ValueError("User profile not found")

        self.is_read = True
        self.save(update_fields=["is_read"])

    def get_seen_list(self):
        """Get list of users who have seen this message with timestamps"""
        seen_list = []

        if self.seen_by_freelancer_at:
            seen_list.append(
                {
                    "username": self.conversation.freelancer_profile.freelancer.username,  # noqa: E501
                    "seen_at": self.seen_by_freelancer_at.isoformat(),
                }
            )

        if self.seen_by_client_at:
            seen_list.append(
                {
                    "username": self.conversation.client_profile.client.username,
                    "seen_at": self.seen_by_client_at.isoformat(),
                }
            )

        return seen_list
