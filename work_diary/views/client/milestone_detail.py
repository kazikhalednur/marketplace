from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.generics import RetrieveAPIView

from accounts.permissions import IsClient

from ...models import Milestone
from ...serializers.client import ClientMilestoneSerializer


@extend_schema_view(
    retrieve=extend_schema(
        summary="Retrieve detailed milestone information",
        description="Retrieve detailed milestone information",
        tags=["client_work_diary"],
    ),
)
class MilestoneDetailView(RetrieveAPIView):
    """Retrieve detailed milestone information for authenticated clients."""

    serializer_class = ClientMilestoneSerializer
    permission_classes = [IsClient]
    lookup_field = "contract__id"
    lookup_url_kwarg = "contract_id"

    def get_queryset(self):
        """
        Filter milestones to only include those owned by the authenticated client.

        Returns:
            QuerySet: Milestones filtered by client ownership with optimized queries
        """
        user = self.request.user
        return Milestone.objects.select_related(
            "contract", "contract__client_profile"
        ).filter(contract__client_profile__client=user)
