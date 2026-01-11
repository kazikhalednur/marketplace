import django_filters

from chat.models import Conversation, Message


class ConversationAdminFilter(django_filters.FilterSet):
    class Meta:
        model = Conversation
        fields = []


class MessageAdminFilter(django_filters.FilterSet):
    conversation = django_filters.NumberFilter(
        field_name="conversation", lookup_expr="exact"
    )
    is_read = django_filters.BooleanFilter(field_name="is_read")

    class Meta:
        model = Message
        fields = ["conversation", "is_read"]
