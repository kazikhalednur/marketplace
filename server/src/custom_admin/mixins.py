from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from .permissions import AdminPermission


class HistoryMixin:
    """
    Mixin that adds a history action to ViewSets.

    This mixin provides a `history` action that returns historical records
    for a specific model instance. It works with django-simple-history.

    Usage:
        class MyViewSet(HistoryMixin, viewsets.ModelViewSet):
            ...

    The history endpoint will be available at:
        GET /api/admin/app/model/{id}/history/
    """

    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, pk=None):
        """
        Get the history of changes for this object.

        Returns a list of historical records showing:
        - history_id: ID of the historical record
        - history_date: When the change occurred
        - history_type: Type of change (Created/Updated/Deleted)
        - history_user: User who made the change
        - changed_fields: List of fields that changed
        - changes: Dictionary of field changes with old and new values
        """
        obj = self.get_object()

        if not hasattr(obj, "history"):
            return Response(
                {"detail": "This model does not have history tracking enabled."},
                status=status.HTTP_404_NOT_FOUND,
            )

        history_records = obj.history.all()

        from .serializers.base import HistorySerializer

        serializer = HistorySerializer(history_records, many=True)

        return Response(serializer.data)


class AdminPermissionMixin:
    """
    Mixin that applies admin permissions to all ViewSet actions.

    This mixin sets the permission_classes to AdminPermission for all actions.
    It ensures that only authenticated staff users with appropriate model
    permissions can access the ViewSet.

    Usage:
        class MyViewSet(AdminPermissionMixin, viewsets.ModelViewSet):
            ...
    """

    permission_classes = [AdminPermission]


class ReadOnlyAdminMixin:
    """
    Mixin for read-only admin ViewSets.

    This mixin restricts the ViewSet to only allow list and retrieve actions.
    It's designed for use with models that should not be modified through the
    admin API (e.g., payment models).

    Usage:
        class MyViewSet(ReadOnlyAdminMixin, viewsets.ReadOnlyModelViewSet):
            ...

    Note: Use with ReadOnlyModelViewSet, not ModelViewSet.
    """

    http_method_names = ["get", "head", "options"]

    def create(self, request, *args, **kwargs):
        """Explicitly disallow create operations."""
        return Response(
            {"detail": "Create operation is not allowed for this resource."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def update(self, request, *args, **kwargs):
        """Explicitly disallow update operations."""
        return Response(
            {"detail": "Update operation is not allowed for this resource."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def partial_update(self, request, *args, **kwargs):
        """Explicitly disallow partial update operations."""
        return Response(
            {"detail": "Update operation is not allowed for this resource."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def destroy(self, request, *args, **kwargs):
        """Explicitly disallow delete operations."""
        return Response(
            {"detail": "Delete operation is not allowed for this resource."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


class BaseAdminViewSetMixin(AdminPermissionMixin, HistoryMixin):
    """
    Combined mixin for standard admin ViewSets.

    This mixin combines AdminPermissionMixin and HistoryMixin to provide
    the standard functionality for admin ViewSets:
    - Staff-only access with model permissions
    - History tracking endpoint

    Usage:
        class MyViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
            queryset = MyModel.objects.all()
            serializer_class = MyModelSerializer
    """

    pass
