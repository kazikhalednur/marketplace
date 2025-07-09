from drf_spectacular.utils import extend_schema
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.views import APIView

from accounts.permissions import IsClient
from utils.helpers import Response

from .models import Category, Job
from .serializers import (
    CategorySkillSerializer,
    DropdownSerializer,
    JobCreateSerializer,
    JobSerializer,
)


class JobListView(ListAPIView):
    permission_classes = []
    queryset = Job.objects.published()
    serializer_class = JobSerializer


class JobDetailView(RetrieveAPIView):
    permission_classes = []
    queryset = Job.objects.published()
    serializer_class = JobSerializer
    lookup_field = "id"


class CategoryListView(ListAPIView):
    permission_classes = []
    queryset = Category.objects.all()
    serializer_class = CategorySkillSerializer


@extend_schema(tags=["Client Jobs"])
class DropdownView(APIView):
    permission_classes = []
    serializer_class = DropdownSerializer

    def get(self, request, *args, **kwargs):
        serializer = self.serializer_class({})
        return Response(data=serializer.data)


@extend_schema(tags=["Client Jobs"])
class JobCreateView(CreateAPIView):
    permission_classes = [IsClient]
    serializer_class = JobCreateSerializer

    def get_queryset(self):
        return Job.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


@extend_schema(tags=["Client Jobs"])
class ClientJobListView(ListAPIView):
    permission_classes = [IsClient]
    serializer_class = JobSerializer

    def get_queryset(self):
        return Job.objects.filter(created_by=self.request.user)


@extend_schema(tags=["Client Jobs"])
class ClientJobRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsClient]
    serializer_class = JobSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Job.objects.filter(created_by=self.request.user)
