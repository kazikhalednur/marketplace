from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class AdminModelSerializer(serializers.ModelSerializer):
    """
    Base serializer for admin endpoints.

    This serializer extends ModelSerializer with common admin functionality:
    - Includes all model fields by default
    - Provides read-only fields for timestamps
    - Can be extended by specific model serializers

    Usage:
        class MyModelAdminSerializer(AdminModelSerializer):
            class Meta:
                model = MyModel
                fields = '__all__'
    """

    class Meta:
        abstract = True


class HistorySerializer(serializers.Serializer):
    """
    Serializer for historical records from django-simple-history.

    This serializer formats historical records to show:
    - history_id: ID of the historical record
    - history_date: When the change occurred
    - history_type: Type of change (+ = Created, ~ = Updated, - = Deleted)
    - history_user: Username of the user who made the change
    - changed_fields: List of field names that changed
    - changes: Dictionary of field changes with old and new values
    """

    history_id = serializers.IntegerField()
    history_date = serializers.DateTimeField()
    history_type = serializers.SerializerMethodField()
    history_user = serializers.SerializerMethodField()
    changed_fields = serializers.SerializerMethodField()
    changes = serializers.SerializerMethodField()

    def get_history_type(self, obj):
        """
        Convert history type symbol to readable string.

        + = Created
        ~ = Updated (Changed)
        - = Deleted
        """
        type_map = {
            "+": "Created",
            "~": "Updated",
            "-": "Deleted",
        }
        return type_map.get(obj.history_type, obj.history_type)

    def get_history_user(self, obj):
        """Get the username of the user who made the change."""
        if obj.history_user:
            return {
                "id": str(obj.history_user.id),
                "username": obj.history_user.username,
                "email": obj.history_user.email,
            }
        return None

    def get_changed_fields(self, obj):
        """
        Get a list of fields that changed in this historical record.

        Compares the current historical record with the previous one to
        determine which fields changed.
        """
        prev_record = obj.prev_record

        if not prev_record:
            return []

        changed = []

        for field in obj.instance._meta.fields:
            field_name = field.name

            if field_name.startswith("history_"):
                continue

            current_value = getattr(obj, field_name, None)
            prev_value = getattr(prev_record, field_name, None)

            if current_value != prev_value:
                changed.append(field_name)

        return changed

    def get_changes(self, obj):
        """
        Get a dictionary of field changes with old and new values.

        Returns a dictionary where keys are field names and values are
        dictionaries with 'old' and 'new' keys.

        Example:
            {
                'status': {'old': 'draft', 'new': 'open'},
                'title': {'old': 'Old Title', 'new': 'New Title'}
            }
        """
        prev_record = obj.prev_record

        if not prev_record:
            return {}

        changes = {}

        for field in obj.instance._meta.fields:
            field_name = field.name
            if field_name.startswith("history_"):
                continue

            current_value = getattr(obj, field_name, None)
            prev_value = getattr(prev_record, field_name, None)

            if current_value != prev_value:
                changes[field_name] = {
                    "old": self._serialize_value(prev_value),
                    "new": self._serialize_value(current_value),
                }

        return changes

    def _serialize_value(self, value):
        """
        Serialize a value for JSON output.

        Handles special types like dates, UUIDs, and related objects.
        """
        if value is None:
            return None

        if hasattr(value, "isoformat"):
            return value.isoformat()

        if hasattr(value, "hex"):
            return str(value)

        if hasattr(value, "pk"):
            return str(value.pk)

        return str(value)
