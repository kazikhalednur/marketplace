import uuid

from django.contrib.postgres.fields import ArrayField
from django.db import models

from accounts.models import User
from chat.models import Conversation


class GoogleMeeting(models.Model):
    id = models.UUIDField(
        primary_key=True, editable=False, serialize=False, unique=True
    )
    conversation: Conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE
    )
    url = models.URLField(max_length=255)
    summary = models.CharField(max_length=255)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    attendees = ArrayField(models.EmailField(), size=2)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid.uuid4()
        super(GoogleMeeting, self).save(*args, **kwargs)
