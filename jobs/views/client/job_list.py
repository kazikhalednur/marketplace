from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

from accounts.permissions import IsClient

from ...models import Job
from ...serializers.client import ClientJobSerializer
from .filters import JobFilter


class JobPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema(tags=["Client Jobs"])
class JobListView(ListAPIView):
    permission_classes = [IsClient]
    serializer_class = ClientJobSerializer
    pagination_class = JobPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = JobFilter

    def get_queryset(self):
        return Job.objects.filter(created_by=self.request.user)
