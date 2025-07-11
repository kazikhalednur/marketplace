from django.urls import path

from . import views
from .views import client as client_views

app_name = "jobs"
urlpatterns = [
    path("dropdown/", client_views.DropdownView.as_view(), name="client_dropdown"),
    path("create/", client_views.JobCreateView.as_view(), name="client_job_create"),
    path(
        "my-jobs/",
        client_views.JobListView.as_view(),
        name="client_job_list",
    ),
    path(
        "my-jobs/<int:pk>/",
        client_views.JobDetailView.as_view(),
        name="client_job_detail",
    ),
    path(
        "categories-skills/",
        views.CategorySkillListView.as_view(),
        name="category_skill_list",
    ),
    path("", views.JobListView.as_view(), name="job_list"),
    path("<int:pk>/", views.JobDetailView.as_view(), name="job_detail"),
]
