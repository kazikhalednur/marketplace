from uuid import uuid4

from django.db import models

from accounts.models import ClientProfile, FreelancerProfile
from biding.models import Contract


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

    contract = models.OneToOneField(
        Contract, related_name="conversation", on_delete=models.CASCADE
    )
    conversation_id = models.CharField(
        max_length=255, unique=True, blank=True, null=True
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

    conversation = models.ForeignKey(
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

    def __str__(self):
        return f"Message {str(self.id)} by {self.freelancer_profile or self.client_profile} at {self.timestamp}"  # noqa: E501

    def save(self, *args, **kwargs):
        if not self.freelancer_profile and not self.client_profile:
            raise ValueError("Either freelancer_profile or client_profile must be set.")
        super().save(*args, **kwargs)


class MessageSeen(models.Model):
    """
    Tracks which users have seen which messages.
    Useful for read receipts in group chats.
    """

    message = models.ForeignKey(
        Message, related_name="seen_by", on_delete=models.CASCADE
    )
    freelancer_profile = models.ForeignKey(
        FreelancerProfile,
        related_name="message_seen_records",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    client_profile = models.ForeignKey(
        ClientProfile,
        related_name="message_seen_records",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    seen_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["message", "freelancer_profile", "client_profile"],
                name="unique_message_seen",
            )
        ]

    def __str__(self):
        return f"MessageSeen {str(self.id)} for {self.message} by {self.freelancer_profile or self.client_profile} at {self.seen_at}"  # noqa: E501

    def save(self, *args, **kwargs):
        if not self.freelancer_profile and not self.client_profile:
            raise ValueError("Either freelancer_profile or client_profile must be set.")
        super().save(*args, **kwargs)
