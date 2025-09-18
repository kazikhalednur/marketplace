from rest_framework.serializers import ModelSerializer

from accounts.models import FreelancerProfile
from notifications.models import Notification
from work_diary.models import MilestoneStep, MilestoneStepSubmission


class FreelancerMilestoneStepSubmissionSerializer(ModelSerializer):
    class Meta:
        model = MilestoneStepSubmission
        fields = ("message", "code_zip")

    def save(self, **kwargs):
        """Save or update milestone step submission"""
        # Get milestone and freelancer_profile from kwargs
        milestone_step: MilestoneStep = kwargs.get("milestone_step")
        freelancer_profile: FreelancerProfile = kwargs.get("freelancer_profile")

        if not milestone_step or not freelancer_profile:
            raise ("milestone and freelancer_profile are required")

        # Check if submission already exists for this milestone step and freelancer
        try:
            existing_submission = (
                MilestoneStepSubmission.objects.filter(
                    milestone_step=milestone_step, freelancer_profile=freelancer_profile
                )
                .order_by("-submitted_at")
                .first()
            )
            # Update existing submission
            if existing_submission:
                for attr, value in self.validated_data.items():
                    setattr(existing_submission, attr, value)
                existing_submission.save()

                Notification.objects.create(
                    user=freelancer_profile.freelancer,
                    message=f"Your submission for {milestone_step.title} has been updated.",  # noqa: E501
                    message_type=Notification.NotificationType.SUCCESS,
                )

                Notification.objects.create(
                    user=milestone_step.milestone.contract.client_profile.client,
                    message=f"Your submission for {milestone_step.title} has been updated.",  # noqa: E501
                    message_type=Notification.NotificationType.SUCCESS,
                )

                return existing_submission
        except (MilestoneStepSubmission.DoesNotExist, AttributeError):
            # Create new submission
            milestone_step_submission = MilestoneStepSubmission.objects.create(
                milestone_step=milestone_step,
                freelancer_profile=freelancer_profile,
                **self.validated_data,
            )

            Notification.objects.create(
                user=freelancer_profile.freelancer,
                message=f"Your submission for {milestone_step.title} has been created.",
                message_type=Notification.NotificationType.SUCCESS,
            )

            return milestone_step_submission
