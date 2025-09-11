from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView

from accounts.permissions import IsFreelancer

from ...models import MilestoneStep
from ...serializers.freelancer import FreelancerMilestoneStepSerializer


@extend_schema(tags=["freelancer_work_diary"])
class MilestoneStepListView(ListAPIView):
    """List all milestone steps for a specific contract (freelancer view)."""

    serializer_class = FreelancerMilestoneStepSerializer
    permission_classes = [IsFreelancer]

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
