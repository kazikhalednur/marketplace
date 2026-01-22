import django_filters

from notifications.models import Notification


class NotificationAdminFilter(django_filters.FilterSet):
    user = django_filters.UUIDFilter(field_name="user", lookup_expr="exact")
    message_type = django_filters.ChoiceFilter(
        field_name="message_type",
        choices=Notification.NotificationType.choices,
        lookup_expr="exact",
    )
    is_read = django_filters.BooleanFilter(field_name="is_read")

    class Meta:
        model = Notification
        fields = ["user", "message_type", "is_read"]
