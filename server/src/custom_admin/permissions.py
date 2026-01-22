from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    message = "You must be a staff user to access admin endpoints."

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_staff
        )


class DjangoModelPermissions(permissions.DjangoModelPermissions):
    """
    Extended Django model permissions that map ViewSet actions to Django permissions.

    This class extends DRF's DjangoModelPermissions to provide more granular control
    over CRUD operations based on Django's built-in permission system.

    Permission mapping:
    - list, retrieve, history → view_<model> permission
    - create → add_<model> permission
    - update, partial_update → change_<model> permission
    - destroy → delete_<model> permission
    """

    perms_map = {
        "GET": ["%(app_label)s.view_%(model_name)s"],
        "OPTIONS": [],
        "HEAD": [],
        "POST": ["%(app_label)s.add_%(model_name)s"],
        "PUT": ["%(app_label)s.change_%(model_name)s"],
        "PATCH": ["%(app_label)s.change_%(model_name)s"],
        "DELETE": ["%(app_label)s.delete_%(model_name)s"],
    }

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        queryset = self._queryset(view)
        if queryset is None:
            return False

        model_cls = queryset.model

        action = getattr(view, "action", None)

        if action == "history":
            perms = self.get_required_permissions("GET", model_cls)
        elif action in ["list", "retrieve"]:
            perms = self.get_required_permissions("GET", model_cls)
        elif action == "create":
            perms = self.get_required_permissions("POST", model_cls)
        elif action in ["update", "partial_update"]:
            perms = self.get_required_permissions("PUT", model_cls)
        elif action == "destroy":
            perms = self.get_required_permissions("DELETE", model_cls)
        else:
            perms = self.get_required_permissions(request.method, model_cls)

        return request.user.has_perms(perms)


class AdminPermission(permissions.BasePermission):
    """
    Combined permission class that requires both staff status and model permissions.

    This is a convenience class that combines IsAdminUser and DjangoModelPermissions.
    Use this as the default permission class for admin ViewSets.
    """

    def has_permission(self, request, view):
        is_staff = IsAdminUser().has_permission(request, view)
        if not is_staff:
            return False
        has_model_perms = DjangoModelPermissions().has_permission(request, view)
        return has_model_perms

    def has_object_permission(self, request, view, obj):
        return DjangoModelPermissions().has_object_permission(request, view, obj)
