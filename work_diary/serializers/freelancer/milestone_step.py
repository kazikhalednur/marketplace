from django.utils import timezone
from rest_framework.serializers import ModelSerializer

from work_diary.models import MilestoneStep


class FreelancerMilestoneStepSerializer(ModelSerializer):
    class Meta:
        model = MilestoneStep
        fields = (
            "id",
            "step_number",
            "title",
            "description",
            "amount",
            "start_date",
            "due_date",
            "message",
            "code_zip",
            "uploaded_at",
            "status",
        )
        read_only_fields = (
            "id",
            "step_number",
            "title",
            "description",
            "amount",
            "start_date",
            "due_date",
            "uploaded_at",
            "status",
        )

    def save(self, **kwargs):
        obj = super().save(**kwargs)
        if obj.code_zip:
            obj.uploaded_at = timezone.now()
            obj.save(update_fields=["uploaded_at"])
        return obj
