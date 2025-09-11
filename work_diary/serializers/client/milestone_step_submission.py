from rest_framework.serializers import ModelSerializer

from work_diary.models import MilestoneStep, MilestoneStepSubmission


class ClientMilestoneStepSubmissionSerializer(ModelSerializer):
    class Meta:
        model = MilestoneStepSubmission
        fields = ("id", "submitted_at", "message", "code_zip", "status")
        read_only_fields = ("id", "submitted_at", "message", "code_zip")

    def save(self, **kwargs):
        milestone_step_submission: MilestoneStepSubmission = super().save(**kwargs)
        if milestone_step_submission.status == MilestoneStepSubmission.Status.ACCEPTED:
            milestone_step_submission.milestone_step.status = (
                MilestoneStep.Status.ACCEPTED
            )
            milestone_step_submission.milestone_step.save(update_fields=["status"])
        return milestone_step_submission
