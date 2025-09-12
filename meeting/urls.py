from django.urls import path

from . import views

app_name = "meetings"

urlpatterns = [
    # Meeting CRUD operations
    path(
        "create/<str:conversation_id>/",
        views.GoogleMeetingCreateView.as_view(),
        name="create_meeting",
    ),
    path(
        "list/<str:conversation_id>/",
        views.GoogleMeetingListView.as_view(),
        name="list_meetings",
    ),
    path(
        "upcoming/<str:conversation_id>/",
        views.GoogleMeetingUpcomingView.as_view(),
        name="upcoming_meetings",
    ),
    path(
        "stats/<str:conversation_id>/",
        views.GoogleMeetingStatsView.as_view(),
        name="meeting_stats",
    ),
]
