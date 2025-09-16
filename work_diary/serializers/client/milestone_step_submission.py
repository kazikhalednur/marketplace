from rest_framework.serializers import ModelSerializer

from notifications.models import Notification
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
            Notification.objects.create(
                user=milestone_step_submission.freelancer_profile.freelancer,
                message=f"Milestone step {milestone_step_submission.milestone_step.title} has been accepted",  # noqa: E501
            )
        return milestone_step_submission
