from django.urls import path

from . import views

app_name = "meetings"

urlpatterns = [
    path(
        "create/",
        views.CreateMeetingView.as_view(),
        name="create_meeting",
    ),
    path(
        "freelancer-list/", views.FreelancerListView.as_view(), name="freelancer_list"
    ),
    path(
        "history/",
        views.MeetingHistoryView.as_view(),
        name="meeting_history",
    ),
    path("my/", views.MyMeetingsView.as_view(), name="my_meetings"),
    path(
        "join/<str:room_name>/",
        views.JoinMeetingView.as_view(),
        name="join_meeting",
    ),
    path(
        "list/<contract_id>",
        views.ContractMeetingListView.as_view(),
        name="contract_meetings",
    ),
]
