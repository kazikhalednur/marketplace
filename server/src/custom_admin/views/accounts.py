from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from accounts.models import (
    OTP,
    AcceptedDomain,
    User,
    WebSocketID,
)
from custom_admin.filters import (
    OTPAdminFilter,
    UserAdminFilter,
    WebSocketIDAdminFilter,
)
from custom_admin.mixins import BaseAdminViewSetMixin
from custom_admin.pagination import AdminPagination
from custom_admin.serializers.accounts import (
    AcceptedDomainAdminSerializer,
    OTPAdminSerializer,
    UserAdminDetailSerializer,
    UserAdminListSerializer,
    WebSocketIDAdminSerializer,
)


class UserAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """
    Unified Admin ViewSet for User model.

    Supports filtering by role to view clients, freelancers, arbitrators, and auditors.
    Detail view (GET /users/{id}/) automatically includes all related data:
    - client_profile (for clients)
    - freelancer_profile with sub_profiles (for freelancers)
    - projects[] (all projects from sub-profiles)
    - education[] (all education records)
    - experience[] (all experience records)

    Actions: list, retrieve, create, update, partial_update, destroy, history
    """

    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = UserAdminFilter
    search_fields = ["email", "username", "first_name", "last_name"]
    ordering_fields = ["date_joined", "last_login", "email", "username"]

    def get_queryset(self):
        """
        Optimize queryset based on action.
        For detail view, prefetch all related data.
        """
        queryset = User.objects.all().order_by("-date_joined")

        if self.action == "retrieve":
            queryset = queryset.select_related(
                "client_profile",
                "freelancer_profile",
            ).prefetch_related(
                "freelancer_profile__freelancer_sub_profiles",
                "freelancer_profile__freelancer_sub_profiles__projects",
                "freelancer_profile__freelancer_sub_profiles__educations",
                "freelancer_profile__freelancer_sub_profiles__experiences",
            )

        return queryset

    def get_serializer_class(self):
        """
        Use different serializers for list vs detail views.
        List view: lightweight without nested data
        Detail view: includes all related foreign key data
        """
        if self.action == "retrieve":
            return UserAdminDetailSerializer
        return UserAdminListSerializer


class OTPAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for OTP model."""

    queryset = OTP.objects.all().select_related("user")
    serializer_class = OTPAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = OTPAdminFilter
    search_fields = ["user__email", "otp"]
    ordering_fields = ["created_at", "expires_at"]


class AcceptedDomainAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for AcceptedDomain model."""

    queryset = AcceptedDomain.objects.all()
    serializer_class = AcceptedDomainAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["domain"]
    ordering_fields = ["created_at", "updated_at", "domain"]


class WebSocketIDAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for WebSocketID model."""

    queryset = WebSocketID.objects.all().select_related("user").order_by("-id")
    serializer_class = WebSocketIDAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = WebSocketIDAdminFilter
    search_fields = ["user__email", "user__username", "websocket_id"]
    ordering_fields = ["id"]
