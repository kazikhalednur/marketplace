from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

from accounts.models import FreelancerProfile
from accounts.permissions import IsFreelancer
from biding.models import Contract
from biding.serializers.freelancer import ContractListSerializer


class ContractListPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema(tags=["freelancer_contracts"])
class ContractListView(ListAPIView):
    """
    List all contracts for the authenticated freelancer.
    """

    serializer_class = ContractListSerializer
    permission_classes = [IsFreelancer]
    pagination_class = ContractListPagination

    def get_queryset(self):
        """Filter contracts for the authenticated freelancer"""
        try:
            freelancer_profile = FreelancerProfile.objects.get(
                freelancer=self.request.user
            )
            return (
                Contract.objects.filter(freelancer_profile=freelancer_profile)
                .select_related("job", "client_profile")
                .order_by("-start_date")
            )
        except FreelancerProfile.DoesNotExist:
            return Contract.objects.none()
