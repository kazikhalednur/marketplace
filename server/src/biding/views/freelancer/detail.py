from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.generics import RetrieveUpdateDestroyAPIView

from accounts.permissions import IsFreelancer

from ...models import Proposal
from ...serializers.freelancer import ProposalSerializer


@extend_schema_view(
    get=extend_schema(tags=["freelancer_proposals"]),
    delete=extend_schema(tags=["freelancer_proposals"]),
)
class ProposalDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsFreelancer]
    serializer_class = ProposalSerializer
    http_method_names = ["get", "delete"]
    lookup_field = "id"

    def get_queryset(self):
        return Proposal.objects.filter(
            freelancer_sub_profile__freelancer_profile__freelancer__id=self.request.user.id  # noqa: E501
        )
