from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.exceptions import NotFound
from rest_framework.generics import RetrieveAPIView, RetrieveUpdateAPIView

from utils.helpers import Response

from ...models import User
from ...serializers.freelancers import UserInfoSerializer


@extend_schema_view(
    patch=extend_schema(
        tags=["freelancer"],
        responses={
            200: inline_serializer(
                name="UserInfoViewResponse",
                fields={
                    "message": drf_serializers.CharField(default="Update Successfully")
                },
            ),
        },
    ),
    get=extend_schema(tags=["freelancer"]),
)
class UserInfoView(RetrieveUpdateAPIView):
    """User detail Read and Update API"""

    http_method_names = ["get", "patch"]
    serializer_class = UserInfoSerializer

    def get_object(self):
        return User.objects.get(id=self.request.user.id)

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(message="Update Successfully")


# Retrieve user info by username
@extend_schema_view(
    get=extend_schema(
        tags=["freelancer"],
        summary="Retrieve user info by username",
        description="Provide a username to retrieve the corresponding user's profile "
        "information.",
    )
)
class UserInfoByUsernameView(RetrieveAPIView):
    """Retrieve user info by username"""

    serializer_class = UserInfoSerializer
    lookup_field = "username"
    queryset = User.objects.all()

    def get_object(self):
        username = self.kwargs.get("username")
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            raise NotFound("User not found.")
