from rest_framework.serializers import ModelSerializer

from work_diary.models import MilestoneStep

from .milestone_step_submission import ClientMilestoneStepSubmissionSerializer


class ClientMilestoneStepListSerializer(ModelSerializer):
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
        )
        read_only_fields = ("id", "step_number")


class ClientMilestoneStepDetailSerializer(ModelSerializer):
    submissions = ClientMilestoneStepSubmissionSerializer(
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
            "submissions",
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
        )


class ClientMilestoneStepCreateSerializer(ModelSerializer):
    class Meta:
        model = MilestoneStep
        fields = (
            "title",
            "description",
            "amount",
            "start_date",
            "due_date",
        )
