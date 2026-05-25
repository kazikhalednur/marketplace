from drf_spectacular.utils import (
    OpenApiParameter,
    PolymorphicProxySerializer,
    extend_schema,
    extend_schema_view,
)
from rest_framework import serializers
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from utils.helpers import Response

from ..models import User
from ..serializers.clients import ClientUserInfoSerializer
from ..serializers.freelancers import UserInfoSerializer


@extend_schema_view(
    get=extend_schema(
        tags=["accounts"],
        operation_id="accounts_username_info_retrieve",
        summary="Get user info by username",
        description="Returns user information based on username. If the user is a client, returns client-specific info. If freelancer, returns freelancer-specific info.",  # noqa: E501
        parameters=[
            OpenApiParameter(
                name="username",
                type=str,
                location=OpenApiParameter.PATH,
                required=True,
            ),
        ],
        responses={
            200: PolymorphicProxySerializer(
                component_name="UsernameInfoResponse",
                serializers=[
                    ClientUserInfoSerializer,
                    UserInfoSerializer,
                ],
                resource_type_field_name=None,
            ),
        },
    ),
)
class UsernameInfoView(RetrieveAPIView):
    """
    Retrieve user information by username.
    Returns different serializer data based on user role (client or freelancer).
    """

    http_method_names = ["get"]
    permission_classes = [IsAuthenticated]
    serializer_class = UserInfoSerializer
    lookup_field = "username"
    lookup_url_kwarg = "username"

    def get_queryset(self):
        return User.objects.all()

    def get_serializer_class(self):
        """
        Dynamically return the appropriate serializer based on the user's role.
        """
        user = self.get_object()
        if user.role == User.UserRole.CLIENT:
            return ClientUserInfoSerializer
        elif user.role == User.UserRole.FREELANCER:
            return UserInfoSerializer
        raise serializers.ValidationError("Invalid user role")

    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve to handle both client and freelancer users.
        """
        instance = self.get_object()
        serializer_class = self.get_serializer_class()
        serializer = serializer_class(instance, context={"request": request})
        return Response(data=serializer.data)
