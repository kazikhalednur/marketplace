from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.views import APIView

from utils.helpers import Response

from ..models import User
from ..serializers.clients import ClientUserInfoSerializer
from ..serializers.freelancers import UserInfoSerializer


@extend_schema_view(
    get=extend_schema(
        tags=["user"],
        responses={
            200: inline_serializer(
                name="UserInfoGetResponse",
                fields={
                    "message": drf_serializers.CharField(
                        default="User info get successfully"
                    ),
                    "data": drf_serializers.DictField(),
                },
            ),
            400: inline_serializer(
                name="InvalidRoleResponse",
                fields={
                    "message": drf_serializers.CharField(default="Invalid user role."),
                },
            ),
            404: inline_serializer(
                name="UserNotFoundResponse",
                fields={
                    "message": drf_serializers.CharField(default="User not found."),
                },
            ),
        },
    ),
)
class UserInfoByUsernameView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            if user.role == "client":
                serializer = ClientUserInfoSerializer(user)
            elif user.role == "freelancer":
                serializer = UserInfoSerializer(user)
            else:
                return Response(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    message="Invalid user role.",
                )
            return Response(
                status_code=status.HTTP_200_OK,
                message="User info get successfully",
                data=serializer.data,
            )
        except User.DoesNotExist:
            return Response(
                status_code=status.HTTP_404_NOT_FOUND, message="User not found."
            )
