from django.urls import path

from . import views

app_name = "meetings"

urlpatterns = [
    path(
        "auth/",
        views.ZoomMeetingSDKAuthView.as_view(),
        name="zoom_meeting_sdk_auth",
    ),
    path(
        "all/",
        views.MeetingListView.as_view(),
        name="meeting_list",
    ),
    path(
        "<str:conversation_id>/",
        views.MeetingListCreateView.as_view(),
        name="meeting_list_create",
    ),
]
