from django.urls import path

from .views import (  # NotificationCreateView,
    DeleteAllNotificationsView,
    DeleteNotificationView,
    MarkAllNotificationsReadView,
    MarkNotificationReadView,
    NotificationListView,
    NotificationStatsView,
)

app_name = "notifications"

urlpatterns = [
    # path("create/", NotificationCreateView.as_view(), name="notification-create"),
    path(
        "read/all/",
        MarkAllNotificationsReadView.as_view(),
        name="notification-mark-all-read",
    ),
    path(
        "read/<int:pk>/",
        MarkNotificationReadView.as_view(),
        name="notification-mark-read",
    ),
    path(
        "delete/all/",
        DeleteAllNotificationsView.as_view(),
        name="notification-delete-all",
    ),
    path(
        "delete/<int:pk>/", DeleteNotificationView.as_view(), name="notification-delete"
    ),
    path("stats/", NotificationStatsView.as_view(), name="notification-stats"),
    path("", NotificationListView.as_view(), name="notification-list"),
]
