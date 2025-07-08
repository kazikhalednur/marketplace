from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
    RetrieveUpdateDestroyAPIView,
)

from accounts.permissions import IsClient

from .models import Category, Job
from .serializers import CategorySerializer, JobSerializer


class JobListView(ListAPIView):
    permission_classes = []
    queryset = Job.objects.all()
    serializer_class = JobSerializer


class CategoryListView(ListAPIView):
    permission_classes = []
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class JobDetailView(RetrieveAPIView):
    permission_classes = []
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    lookup_field = "id"


class CategoryDetailView(RetrieveAPIView):
    permission_classes = []
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "id"


class JobCreateView(CreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsClient]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class JobRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsClient]
    lookup_field = "id"


class CategoryCreateView(CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsClient]
