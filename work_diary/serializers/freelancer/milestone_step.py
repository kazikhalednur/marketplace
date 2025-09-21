from django.utils import timezone
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from biding.models import Contract
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

    def validate(self, attrs):
        if self.context.get("contract_id"):
            try:
                Contract.objects.get(id=self.context.get("contract_id"))
            except Contract.DoesNotExist:
                raise serializers.ValidationError(
                    {"detail": "No Contract matches the given query."}
                )

        return super().validate(attrs)
