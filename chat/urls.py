from django.urls import path

from . import views

urlpatterns = [
    # Conversation endpoints
    path(
        "conversations/", views.ConversationListView.as_view(), name="conversation-list"
    ),
    path(
        "conversations/<str:conversation_id>/",
        views.ConversationDetailView.as_view(),
        name="conversation-detail",
    ),
    path(
        "conversations/<str:conversation_id>/status/",
        views.ConversationStatusView.as_view(),
        name="conversation-status",
    ),
    # Message endpoints
    path(
        "conversations/<str:conversation_id>/messages/",
        views.MessageListView.as_view(),
        name="message-list",
    ),
    # Read receipt endpoints
    path(
        "conversations/<str:conversation_id>/messages/<int:message_id>/read/",
        views.MarkMessageAsReadView.as_view(),
        name="mark-message-read",
    ),
    path(
        "conversations/<str:conversation_id>/messages/read-all/",
        views.MarkAllMessagesAsReadView.as_view(),
        name="mark-all-messages-read",
    ),
    # Contract to conversation creation
    path(
        "contracts/<int:contract_id>/conversation/",
        views.create_conversation_from_contract,
        name="create-conversation-from-contract",
    ),
]
