from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.generics import UpdateAPIView

from accounts.permissions import IsClient

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
        contract_id = self.kwargs.get("contract_id")
        return MilestoneStep.objects.select_related(
            "milestone",
            "milestone__contract",
            "milestone__contract__client_profile",
        ).filter(
            milestone__contract__id=contract_id,
            milestone__contract__client_profile__client=user,
        )
