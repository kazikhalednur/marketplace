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


class ZoomMeeting(models.Model):
    id = models.UUIDField(
        primary_key=True, editable=False, serialize=False, unique=True
    )
    conversation: Conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE
    )
    zoom_id = models.CharField(max_length=50, unique=True)
    topic = models.CharField(max_length=400)
    password = models.CharField(max_length=10, null=True, blank=True)
    role = models.IntegerField(default=0)
    duration = models.IntegerField(default=30)
    start_time = models.DateTimeField(null=True, blank=True)
    join_url = models.URLField(max_length=10000)
    start_url = models.URLField(max_length=10000)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.topic

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid.uuid4()
        super(ZoomMeeting, self).save(*args, **kwargs)
