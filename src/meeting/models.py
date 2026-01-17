import uuid

from django.db import models
from simple_history.models import HistoricalRecords

from accounts.models import User
from biding.models import Contract

from .utils import generate_short_uid


class Meeting(models.Model):
    id = models.UUIDField(
        primary_key=True, editable=False, serialize=False, unique=True
    )
    contract = models.ForeignKey(
        Contract, on_delete=models.CASCADE, related_name="contract_meeting"
    )
    room_name = models.CharField(max_length=10, unique=True, blank=True)
    topic = models.CharField(max_length=400)
    duration = models.IntegerField(default=30)
    start_date = models.DateField()
    start_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    # class Meta:
    #     constraints = [
    #         models.UniqueConstraint(
    #             fields=["created_by", "guest", "start_date"],
    #             name="unique_meeting",
    #         )
    #     ]

    def __str__(self):
        return self.topic

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid.uuid4()
        if not self.room_name:
            self.room_name = generate_short_uid()
        super(Meeting, self).save(*args, **kwargs)


class MeetingHistory(models.Model):
    meeting = models.ForeignKey(
        Meeting, on_delete=models.CASCADE, related_name="meeting_history"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.user} joined {self.meeting} at {self.joined_at}"
