from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response

from accounts.permissions import IsFreelancer

from ...models import MilestoneStep
from ...serializers.freelancer import FreelancerMilestoneStepSubmissionSerializer


@extend_schema(tags=["freelancer_work_diary"])
class MilestoneStepSubmissionView(CreateAPIView):
    """Create or update a milestone step submission (freelancer view)."""

    serializer_class = FreelancerMilestoneStepSubmissionSerializer
    permission_classes = [IsFreelancer]

    def perform_create(self, serializer):
        """Create or update a milestone step submission with create_or_update logic."""
        step_id = self.kwargs.get("step_id")
        contract_id = self.kwargs.get("contract_id")
        step = MilestoneStep.objects.select_related(
            "milestone",
            "milestone__contract",
            "milestone__contract__freelancer_profile",
            "milestone__contract__freelancer_profile__freelancer",
        ).get(
            id=step_id,
            milestone__contract__id=contract_id,
            milestone__contract__freelancer_profile__freelancer=self.request.user,
        )
        serializer.save(
            freelancer_profile=step.milestone.contract.freelancer_profile,
            milestone=step,
        )

    @extend_schema(
        responses={
            200: inline_serializer(
                name="MilestoneStepSubmissionViewResponse",
                fields={
                    "message": drf_serializers.CharField(
                        default="File submitted successfully"
                    ),
                    "created": drf_serializers.BooleanField(default=True),
                },
            ),
        },
    )
    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(
            {
                "message": "File submitted successfully",
            },
            status=status.HTTP_201_CREATED,
        )
