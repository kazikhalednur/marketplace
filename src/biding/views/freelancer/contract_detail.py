from drf_spectacular.utils import extend_schema
from rest_framework.generics import RetrieveAPIView

from accounts.models import FreelancerProfile
from accounts.permissions import IsFreelancer
from biding.models import Contract
from biding.serializers.freelancer import ContractDetailSerializer


@extend_schema(tags=["freelancer_contracts"])
class ContractDetailView(RetrieveAPIView):
    """
    Retrieve a specific contract for the authenticated freelancer.
    """

    serializer_class = ContractDetailSerializer
    permission_classes = [IsFreelancer]
    lookup_field = "id"
    lookup_url_kwarg = "contract_id"

    def get_queryset(self):
        """Filter contracts for the authenticated freelancer"""
        try:
            freelancer_profile = FreelancerProfile.objects.get(
                freelancer=self.request.user
            )
            return Contract.objects.filter(
                freelancer_profile=freelancer_profile
            ).select_related("job", "client_profile")
        except FreelancerProfile.DoesNotExist:
            return Contract.objects.none()
