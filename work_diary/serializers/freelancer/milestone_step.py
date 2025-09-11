from rest_framework.serializers import ModelSerializer

from work_diary.models import MilestoneStep

from .milestone_step_submission import FreelancerMilestoneStepSubmissionSerializer


class FreelancerMilestoneStepSerializer(ModelSerializer):
    submissions = FreelancerMilestoneStepSubmissionSerializer(
        many=True, read_only=True, source="submissions.all"
    )

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
            "status",
            "submissions",
        )
        read_only_fields = ("id",)
