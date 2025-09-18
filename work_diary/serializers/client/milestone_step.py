from rest_framework.serializers import ModelSerializer

from work_diary.models import MilestoneStep


class ClientMilestoneStepSerializer(ModelSerializer):
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
        read_only_fields = ("id", "step_number", "uploaded_at", "code_zip", "message")

    # def save(self, **kwargs):
    #     if self.instance and self.instance.status == MilestoneStep.Status.SUBMITTED:
    #         raise serializers.ValidationError(
    #             {"status": "Cannot modify a submitted milestone step."}
    #         )
    #     return super().save(**kwargs)
