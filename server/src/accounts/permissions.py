from rest_framework.permissions import BasePermission

from .models import User


class IsClient(BasePermission):
    """
    Allows access only to admin users.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.UserRole.CLIENT
        )


class IsFreelancer(BasePermission):
    """
    Allows access only to admin users.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.UserRole.FREELANCER
        )
