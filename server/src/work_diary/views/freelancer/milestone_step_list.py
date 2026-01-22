from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

from accounts.permissions import IsFreelancer

from ...models import MilestoneStep
from ...serializers.freelancer import FreelancerMilestoneStepSerializer


class MilestoneStepPagination(PageNumberPagination):
    """Custom pagination class for milestone step lists with configurable page size."""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema(tags=["freelancer_work_diary"])
@extend_schema_view(
    list=extend_schema(
        summary="List all milestone steps for a specific contract",
        description="List all milestone steps for a specific contract",
    ),
)
class MilestoneStepListView(ListAPIView):
    """List all milestone steps for a specific contract (freelancer view)."""

    serializer_class = FreelancerMilestoneStepSerializer
    permission_classes = [IsFreelancer]
    pagination_class = MilestoneStepPagination

    def get_queryset(self):
        """Filter milestone steps to contracts owned by the authenticated freelancer."""
        user = self.request.user
        contract_id = self.kwargs.get("contract_id")
        return (
            MilestoneStep.objects.select_related(
                "milestone",
                "milestone__contract",
                "milestone__contract__freelancer_profile",
                "milestone__contract__freelancer_profile__freelancer",
            )
            .filter(
                milestone__contract__id=contract_id,
                milestone__contract__freelancer_profile__freelancer=user,
            )
            .order_by("step_number")
        )
