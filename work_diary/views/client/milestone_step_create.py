from django.db.models import Max
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response

from accounts.permissions import IsClient

from ...models import Milestone, MilestoneStep
from ...serializers.client import ClientMilestoneStepCreateSerializer


@extend_schema(tags=["client_work_diary"])
class MilestoneStepCreateView(CreateAPIView):
    """Create a new milestone step for a specific contract (client view)."""

    serializer_class = ClientMilestoneStepCreateSerializer
    permission_classes = [IsClient]

    def perform_create(self, serializer):
        """Create milestone step with auto-assigned step number if not provided."""
        contract_id = self.kwargs.get("contract_id")
        milestone = Milestone.objects.select_related(
            "contract", "contract__client_profile"
        ).get(
            contract__id=contract_id, contract__client_profile__client=self.request.user
        )
        # Auto-assign next step number if not provided
        if not serializer.validated_data.get("step_number"):
            next_num = (
                MilestoneStep.objects.filter(milestone=milestone)
                .aggregate(Max("step_number"))
                .get("step_number__max")
                or 0
            ) + 1
            serializer.validated_data["step_number"] = next_num
        serializer.save(milestone=milestone)

    @extend_schema(
        responses={
            200: inline_serializer(
                name="MilestoneStepCreateViewResponse",
                fields={
                    "message": drf_serializers.CharField(
                        default="Step created successfully"
                    ),
                },
            ),
        },
    )
    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(
            {"message": "Step created successfully"}, status=status.HTTP_201_CREATED
        )
