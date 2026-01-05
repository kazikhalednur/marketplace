from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.generics import RetrieveAPIView

from accounts.permissions import IsFreelancer

from ...models import Milestone
from ...serializers.freelancer import FreelancerMilestoneSerializer


@extend_schema(tags=["freelancer_work_diary"])
@extend_schema_view(
    retrieve=extend_schema(
        summary="Retrieve detailed milestone information",
        description="Retrieve detailed milestone information",
    ),
)
class MilestoneDetailView(RetrieveAPIView):
    """Retrieve detailed milestone information for authenticated freelancers."""

    serializer_class = FreelancerMilestoneSerializer
    permission_classes = [IsFreelancer]
    lookup_field = "contract__id"
    lookup_url_kwarg = "contract_id"

    def get_queryset(self):
        """Filter milestones to contracts owned by the authenticated freelancer."""
        user = self.request.user
        return Milestone.objects.select_related(
            "contract",
            "contract__freelancer_profile",
            "contract__freelancer_profile__freelancer",
        ).filter(contract__freelancer_profile__freelancer=user)
