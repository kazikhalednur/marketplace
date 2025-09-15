from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.generics import RetrieveAPIView

from accounts.permissions import IsClient

from ...models import MilestoneStep
from ...serializers.client import ClientMilestoneStepDetailSerializer


@extend_schema_view(
    retrieve=extend_schema(
        summary="Retrieve detailed milestone step information",
        description="Retrieve detailed milestone step information",
        tags=["client_work_diary"],
    ),
)
class MilestoneStepDetailView(RetrieveAPIView):
    """Retrieve detailed milestone step information (client view)."""

    serializer_class = ClientMilestoneStepDetailSerializer
    permission_classes = [IsClient]
    lookup_field = "id"
    lookup_url_kwarg = "step_id"

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
