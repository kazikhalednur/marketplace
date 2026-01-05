from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

from accounts.permissions import IsClient

from ...models import Proposal
from ...serializers.client import ClientProposalSerializer


class ProposalPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema(tags=["client_proposals"])
class ProposalListlView(ListAPIView):
    permission_classes = [IsClient]
    serializer_class = ClientProposalSerializer
    pagination_class = ProposalPagination

    def get_queryset(self):
        return Proposal.objects.filter(
            job__created_by__id=self.request.user.id, job__id=self.kwargs["job_id"]
        )
