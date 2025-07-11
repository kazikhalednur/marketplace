from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView

from accounts.permissions import IsClient
from utils.helpers import Response

from ...serializers.client import DropdownSerializer


@extend_schema(tags=["Client Jobs"])
class DropdownView(APIView):
    permission_classes = [IsClient]
    serializer_class = DropdownSerializer

    def get(self, request, *args, **kwargs):
        serializer = self.serializer_class({})
        return Response(data=serializer.data)
