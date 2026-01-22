from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.generics import RetrieveUpdateAPIView

from utils.helpers import Response

from ...models import User
from ...serializers.clients import ClientUserInfoSerializer


@extend_schema_view(
    patch=extend_schema(
        tags=["client"],
        responses={
            200: inline_serializer(
                name="ClientUserInfoViewResponse",
                fields={
                    "message": drf_serializers.CharField(default="Update Successfully")
                },
            ),
        },
    ),
    get=extend_schema(tags=["client"]),
)
class UserInfoView(RetrieveUpdateAPIView):
    """User detail Read and Update API"""

    http_method_names = ["get", "patch"]
    serializer_class = ClientUserInfoSerializer

    def get_object(self):
        return User.objects.get(id=self.request.user.id)

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(message="Update Successfully")
