from django.urls import path

from . import views

app_name = "jobs"
urlpatterns = [
    path("dropdown/", views.DropdownView.as_view(), name="dropdown"),
    path("create/", views.JobCreateView.as_view(), name="job_create"),
    path(
        "my-jobs/",
        views.ClientJobListView.as_view(),
        name="job_update",
    ),
    path(
        "my-jobs/<int:pk>/",
        views.ClientJobRetrieveUpdateDestroyView.as_view(),
        name="job_update",
    ),
    path("categories-skills/", views.CategoryListView.as_view(), name="category_list"),
    path("/", views.JobListView.as_view(), name="job_list"),
    path("<int:pk>/", views.JobDetailView.as_view(), name="job_detail"),
]
