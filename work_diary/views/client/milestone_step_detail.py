from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import serializers
from rest_framework.generics import UpdateAPIView

from accounts.permissions import IsClient
from biding.models import Contract

from ...models import MilestoneStep
from ...serializers.client import ClientMilestoneStepSerializer


@extend_schema(tags=["client_work_diary"])
@extend_schema_view(
    patch=extend_schema(
        summary="Update a milestone step",
        description="Update a milestone step",
    ),
)
class MilestoneStepDetailView(UpdateAPIView):
    """Update a milestone step (client view)."""

    serializer_class = ClientMilestoneStepSerializer
    permission_classes = [IsClient]
    lookup_field = "id"
    lookup_url_kwarg = "step_id"
    http_method_names = ["patch"]

    def get_queryset(self):
        """Filter milestone steps to contracts owned by the authenticated client."""
        user = self.request.user
        try:
            contract_id = self.kwargs.get("contract_id")
            contract: Contract = Contract.objects.get(
                id=contract_id, client_profile__client=user
            )
            return MilestoneStep.objects.select_related(
                "milestone",
                "milestone__contract",
                "milestone__contract__client_profile",
            ).filter(milestone__contract=contract)
        except Contract.DoesNotExist:
            raise serializers.ValidationError({"contract": "Contract not found"})

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["contract_id"] = self.kwargs.get("contract_id")
        return context
