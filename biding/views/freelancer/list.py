from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.generics import ListCreateAPIView
from rest_framework.pagination import PageNumberPagination

from accounts.permissions import IsFreelancer

from ...models import Proposal
from ...serializers.freelancer import ProposalSerializer


class JobPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema_view(
    get=extend_schema(tags=["Freelancer Proposals"]),
    post=extend_schema(tags=["Freelancer Proposals"]),
)
class ProposalListView(ListCreateAPIView):
    permission_classes = [IsFreelancer]
    serializer_class = ProposalSerializer
    pagination_class = JobPagination

    def get_queryset(self):
        return Proposal.objects.filter(
            freelancer_sub_profile__freelancer_profile__freelancer__id=self.request.user.id  # noqa: E501
        )

    def perform_create(self, serializer):
        serializer.save(
            freelancer_sub_profile=self.request.user.freelancer_profile.freelancer_sub_profiles.first()  # noqa: E501
        )
