from django.contrib.auth.models import AnonymousUser
from rest_framework.permissions import BasePermission as DRFBasePermission


class BasePermission(DRFBasePermission):
    """
    Async-compatible base permission for Django Channels,
    adapting DRF permissions to Channels' `scope`.
    """

    async def has_permission(self, scope, consumer=None):
        """
        Async-compatible wrapper around DRF's `has_permission`.
        """
        request = self.scope_to_request(scope)
        return super().has_permission(request, view=consumer)

    async def has_object_permission(self, scope, consumer, obj):
        """
        Async-compatible wrapper around DRF's `has_object_permission`.
        """
        request = self.scope_to_request(scope)
        return super().has_object_permission(request, view=consumer, obj=obj)

    def scope_to_request(self, scope):
        """
        Converts Channels `scope` to a lightweight `request` object
        compatible with DRF permissions.
        """

        class DummyRequest:
            def __init__(self, user):
                self.user = user

        return DummyRequest(scope.get("user"))


class AllowAny(BasePermission):
    """
    Allow any connection without authentication.
    This includes anonymous users.
    """

    async def has_permission(self, scope, consumer=None):
        return True


class IsAuthenticated(BasePermission):
    """
    Require authenticated user for WebSocket connection.
    Rejects anonymous users immediately.
    """

    async def has_permission(self, scope, consumer=None):
        user = scope.get("user")
        # Explicitly check for AnonymousUser and reject
        if user is None or isinstance(user, AnonymousUser):
            return False
        return user.is_authenticated


class IsStaff(BasePermission):
    """
    Require authenticated staff user for WebSocket connection.
    Rejects anonymous users immediately.
    """

    async def has_permission(self, scope, consumer=None):
        user = scope.get("user")
        # Explicitly check for AnonymousUser and reject
        if user is None or isinstance(user, AnonymousUser):
            return False
        return user.is_authenticated and user.is_staff


class IsFreelancer(BasePermission):
    """
    Require authenticated freelancer user for WebSocket connection.
    Rejects anonymous users immediately.
    """

    async def has_permission(self, scope, consumer=None):
        user = scope.get("user")
        # Explicitly check for AnonymousUser and reject
        if user is None or isinstance(user, AnonymousUser):
            return False
        return (
            user.is_authenticated
            and hasattr(user, "is_freelancer")
            and user.is_freelancer()
        )


class IsClient(BasePermission):
    """
    Require authenticated client user for WebSocket connection.
    Rejects anonymous users immediately.
    """

    async def has_permission(self, scope, consumer=None):
        user = scope.get("user")
        # Explicitly check for AnonymousUser and reject
        if user is None or isinstance(user, AnonymousUser):
            return False
        return user.is_authenticated and hasattr(user, "is_client") and user.is_client()


class IsAuthenticatedOrReadOnly(BasePermission):
    """
    Allow read-only access for unauthenticated users, full access for authenticated users.  # noqa: E501
    This is useful for public WebSocket connections that allow anonymous viewing.
    """

    async def has_permission(self, scope, consumer=None):
        user = scope.get("user")
        # Allow anonymous users for read-only access
        if user is None or isinstance(user, AnonymousUser):
            return True
        return user.is_authenticated
