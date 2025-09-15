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
        milestone: MilestoneStep = kwargs.get("milestone")
        freelancer_profile: FreelancerProfile = kwargs.get("freelancer_profile")

        if not milestone or not freelancer_profile:
            raise ValueError("milestone and freelancer_profile are required")

        # Check if submission already exists for this milestone step and freelancer
        try:
            existing_submission = (
                MilestoneStepSubmission.objects.filter(
                    milestone_step=milestone, freelancer_profile=freelancer_profile
                )
                .order_by("-submitted_at")
                .first()
            )

            # If existing submission has failed status, create a new one
            if existing_submission.status == MilestoneStepSubmission.Status.REJECTED:
                milestone_step_submission_new = MilestoneStepSubmission.objects.create(
                    milestone_step=milestone,
                    freelancer_profile=freelancer_profile,
                    **self.validated_data,
                )

                milestone_step_submission_new.milestone_step.status = (
                    MilestoneStep.Status.SUBMITTED
                )
                milestone_step_submission_new.milestone_step.save(
                    update_fields=["status"]
                )

                Notification.objects.create(
                    user=freelancer_profile.freelancer,
                    message=f"Your submission for {milestone.title} has been created.",
                    message_type=Notification.NotificationType.SUCCESS,
                )

                Notification.objects.create(
                    user=milestone.milestone.contract.client_profile.client,
                    message=f"Your submission for {milestone.title} has been created.",
                    message_type=Notification.NotificationType.SUCCESS,
                )

                return milestone_step_submission_new
            else:
                # Update existing submission (only if not failed)
                for attr, value in self.validated_data.items():
                    setattr(existing_submission, attr, value)
                existing_submission.save()

                Notification.objects.create(
                    user=freelancer_profile.freelancer,
                    message=f"Your submission for {milestone.title} has been updated.",
                    message_type=Notification.NotificationType.SUCCESS,
                )

                Notification.objects.create(
                    user=milestone.milestone.contract.client_profile.client,
                    message=f"Your submission for {milestone.title} has been updated.",
                    message_type=Notification.NotificationType.SUCCESS,
                )

                return existing_submission
        except (MilestoneStepSubmission.DoesNotExist, AttributeError):
            # Create new submission
            milestone_step_submission = MilestoneStepSubmission.objects.create(
                milestone_step=milestone,
                freelancer_profile=freelancer_profile,
                **self.validated_data,
            )

            milestone_step_submission.milestone_step.status = (
                MilestoneStep.Status.SUBMITTED
            )
            milestone_step_submission.milestone_step.save(update_fields=["status"])

            Notification.objects.create(
                user=freelancer_profile.freelancer,
                message=f"Your submission for {milestone.title} has been created.",
                message_type=Notification.NotificationType.SUCCESS,
            )

            return milestone_step_submission
