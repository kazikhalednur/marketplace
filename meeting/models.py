import uuid

from django.db import models
from simple_history.models import HistoricalRecords

from accounts.models import User
from chat.models import Conversation


class Meeting(models.Model):
    id = models.UUIDField(
        primary_key=True, editable=False, serialize=False, unique=True
    )
    conversation: Conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE
    )
    meeting_id = models.CharField(max_length=50, unique=True)
    topic = models.CharField(max_length=400)
    password = models.CharField(max_length=10, null=True, blank=True)
    duration = models.IntegerField(default=30)
    start_time = models.DateTimeField(null=True, blank=True)
    join_url = models.URLField(max_length=10000)
    start_url = models.URLField(max_length=10000)
    raw_response = models.JSONField(null=True, blank=True)
    tk_client = models.CharField(max_length=10000, null=True, blank=True)
    tk_freelancer = models.CharField(max_length=10000, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    def __str__(self):
        return self.topic

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid.uuid4()
        super(Meeting, self).save(*args, **kwargs)
