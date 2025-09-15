from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

from accounts.permissions import IsClient

from ...models import MilestoneStep
from ...serializers.client import ClientMilestoneStepListSerializer


class MilestoneStepPagination(PageNumberPagination):
    """Custom pagination class for milestone step lists with configurable page size."""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema_view(
    list=extend_schema(
        summary="List all milestone steps for a specific contract",
        description="List all milestone steps for a specific contract",
        tags=["client_work_diary"],
    ),
)
class MilestoneStepListView(ListAPIView):
    """List all milestone steps for a specific contract (client view)."""

    serializer_class = ClientMilestoneStepListSerializer
    permission_classes = [IsClient]
    pagination_class = MilestoneStepPagination

    def get_queryset(self):
        """Filter milestone steps to contracts owned by the authenticated client."""
        user = self.request.user
        contract_id = self.kwargs.get("contract_id")
        return (
            MilestoneStep.objects.select_related(
                "milestone",
                "milestone__contract",
                "milestone__contract__client_profile",
            )
            .filter(
                milestone__contract__id=contract_id,
                milestone__contract__client_profile__client=user,
            )
            .order_by("step_number")
        )
