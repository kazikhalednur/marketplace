from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.generics import RetrieveAPIView

from accounts.permissions import IsFreelancer

from ...models import MilestoneStep
from ...serializers.freelancer import FreelancerMilestoneStepSerializer


@extend_schema_view(
    retrieve=extend_schema(
        summary="Retrieve detailed milestone step information",
        description="Retrieve detailed milestone step information",
        tags=["freelancer_work_diary"],
    ),
)
class MilestoneStepDetailView(RetrieveAPIView):
    """Retrieve detailed milestone step information (freelancer view)."""

    serializer_class = FreelancerMilestoneStepSerializer
    permission_classes = [IsFreelancer]
    lookup_field = "id"
    lookup_url_kwarg = "step_id"

    def get_queryset(self):
        """Filter milestone steps to contracts owned by the authenticated freelancer."""
        user = self.request.user
        return MilestoneStep.objects.select_related(
            "milestone",
            "milestone__contract",
            "milestone__contract__freelancer_profile",
            "milestone__contract__freelancer_profile__freelancer",
        ).filter(
            milestone__contract__freelancer_profile__freelancer=user,
        )
