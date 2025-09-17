from django.urls import path

from . import views, zoom_views

app_name = "meetings"

urlpatterns = [
    # Google Meeting CRUD operations
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
    # Zoom Meeting CRUD operations
    path(
        "zoom/create/<str:conversation_id>/",
        zoom_views.ZoomMeetingCreateView.as_view(),
        name="zoom_create_meeting",
    ),
    path(
        "zoom/list/<str:conversation_id>/",
        zoom_views.ZoomMeetingConversationListView.as_view(),
        name="zoom_list_meetings",
    ),
    path(
        "zoom/upcoming/<str:conversation_id>/",
        zoom_views.ZoomMeetingUpcomingView.as_view(),
        name="zoom_upcoming_meetings",
    ),
    path(
        "zoom/stats/<str:conversation_id>/",
        zoom_views.ZoomMeetingStatsView.as_view(),
        name="zoom_meeting_stats",
    ),
    path(
        "zoom/detail/<str:conversation_id>/<uuid:meeting_id>/",
        zoom_views.ZoomMeetingDetailView.as_view(),
        name="zoom_meeting_detail",
    ),
    path(
        "zoom/registrant/<str:conversation_id>/<uuid:meeting_id>/",
        zoom_views.ZoomMeetingRegistrantView.as_view(),
        name="zoom_meeting_registrant",
    ),
    path(
        "zoom/sync/<str:conversation_id>/<uuid:meeting_id>/",
        zoom_views.ZoomMeetingSyncView.as_view(),
        name="zoom_meeting_sync",
    ),
    path(
        "zoom/list/",
        zoom_views.ZoomMeetingListView.as_view(),
        name="zoom_list_meetings",
    ),
    # All meetings (Google + Zoom) for authenticated user
    path(
        "all/",
        views.AllMeetingsListView.as_view(),
        name="all_meetings",
    ),
]
