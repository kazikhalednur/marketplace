from drf_spectacular.utils import extend_schema
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response

from accounts.permissions import IsClient
from work_diary.models import MilestoneStepSubmission
from work_diary.serializers.client import ClientMilestoneStepSubmissionSerializer


class StatusUpdateSerializer(drf_serializers.Serializer):
    status = drf_serializers.ChoiceField(
        choices=MilestoneStepSubmission.Status.choices,
        help_text="New status for the submission",
    )
    feedback = drf_serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Optional feedback for the freelancer",
    )


@extend_schema(tags=["client_work_diary"])
class MilestoneStepSubmissionUpdateView(UpdateAPIView):
    """Update milestone step submission status (approve/reject) (client view)."""

    serializer_class = ClientMilestoneStepSubmissionSerializer
    permission_classes = [IsClient]
    lookup_field = "id"
    lookup_url_kwarg = "submission_id"
    http_method_names = ["patch"]

    def get_queryset(self):
        """Filter submissions for milestone steps owned by the client."""
        user = self.request.user
        step_id = self.kwargs.get("step_id")
        contract_id = self.kwargs.get("contract_id")
        return MilestoneStepSubmission.objects.select_related(
            "milestone_step",
            "milestone_step__milestone",
            "milestone_step__milestone__contract",
            "milestone_step__milestone__contract__client_profile",
            "freelancer_profile",
            "freelancer_profile__freelancer",
        ).filter(
            milestone_step__milestone__contract__client_profile__client=user,
            milestone_step__id=step_id,
            milestone_step__milestone__contract__id=contract_id,
        )

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(
            {
                "message": "Submission updated successfully",
            },
            status=status.HTTP_200_OK,
        )
