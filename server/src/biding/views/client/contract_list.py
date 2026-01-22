from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

from accounts.models import ClientProfile
from accounts.permissions import IsClient
from biding.models import Contract
from biding.serializers.client import ClientContractListSerializer


class ContractListPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema(tags=["client_contracts"])
class ContractListView(ListAPIView):
    """
    List all contracts for the authenticated client.
    """

    serializer_class = ClientContractListSerializer
    permission_classes = [IsClient]
    pagination_class = ContractListPagination

    def get_queryset(self):
        """Filter contracts for the authenticated client"""
        try:
            client_profile = ClientProfile.objects.get(client=self.request.user)
            return (
                Contract.objects.filter(client_profile=client_profile)
                .select_related("job", "freelancer_profile", "freelancer_sub_profile")
                .order_by("-start_date")
            )
        except ClientProfile.DoesNotExist:
            return Contract.objects.none()
