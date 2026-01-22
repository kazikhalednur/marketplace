from drf_spectacular.utils import extend_schema
from rest_framework.generics import UpdateAPIView

from accounts.permissions import IsClient

from ...models import Proposal
from ...serializers.client import ClientProposalSerializer


@extend_schema(tags=["client_proposals"])
class ProposalUpdateView(UpdateAPIView):
    permission_classes = [IsClient]
    serializer_class = ClientProposalSerializer
    http_method_names = ["patch"]
    lookup_field = "id"
    lookup_url_kwarg = "proposal_id"

    def get_queryset(self):
        return Proposal.objects.filter(job__created_by__id=self.request.user.id)
