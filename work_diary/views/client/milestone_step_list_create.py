from django.db.models import Max
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from rest_framework import serializers
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.generics import ListCreateAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from accounts.permissions import IsClient
from biding.models import Contract
from work_diary.models import Milestone

from ...models import MilestoneStep
from ...serializers.client import ClientMilestoneStepSerializer


class MilestoneStepPagination(PageNumberPagination):
    """Custom pagination class for milestone step lists with configurable page size."""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema(tags=["client_work_diary"])
@extend_schema_view(
    list=extend_schema(
        summary="List all milestone steps for a specific contract",
        description="List all milestone steps for a specific contract",
    ),
)
class MilestoneStepListCreateView(ListCreateAPIView):
    """List all milestone steps for a specific contract (client view)."""

    serializer_class = ClientMilestoneStepSerializer
    permission_classes = [IsClient]
    pagination_class = MilestoneStepPagination

    def get_queryset(self):
        """Filter milestone steps to contracts owned by the authenticated client."""
        user = self.request.user
        try:
            contract_id = self.kwargs.get("contract_id")
            contract: Contract = Contract.objects.select_related("client_profile").get(
                id=contract_id,
                client_profile__client=user,
            )

            return (
                MilestoneStep.objects.select_related(
                    "milestone",
                    "milestone__contract",
                    "milestone__contract__client_profile",
                )
                .filter(milestone__contract=contract)
                .order_by("step_number")
            )
        except Contract.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "No Contract matches the given query."}
            )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["contract_id"] = self.kwargs.get("contract_id")
        return context

    def perform_create(self, serializer):
        """Create milestone step with auto-assigned step number if not provided."""

        contract_id = self.kwargs.get("contract_id")

        # First verify the contract exists and user has access
        contract = get_object_or_404(
            Contract.objects.select_related("client_profile"),
            id=contract_id,
            client_profile__client=self.request.user,
        )

        # Get or create milestone for this contract
        milestone, created = Milestone.objects.get_or_create(
            contract=contract, defaults={"status": Milestone.Status.PENDING}
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
