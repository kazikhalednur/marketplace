from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny

from ..filters import JobFilter
from ..models import Job
from ..serializers import JobSerializer


class JobPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class JobListView(ListAPIView):
    permission_classes = [AllowAny]
    queryset = Job.objects.published()
    serializer_class = JobSerializer
    pagination_class = JobPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = JobFilter

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
