from django.urls import path

from . import views

app_name = "jobs"
urlpatterns = [
    path("categories/", views.CategoryListView.as_view(), name="category_list"),
    path(
        "categories/<int:pk>/",
        views.CategoryDetailView.as_view(),
        name="category_detail",
    ),
    path("job/create/", views.JobCreateView.as_view(), name="job_create"),
    path(
        "job/<int:pk>/",
        views.JobRetrieveUpdateDestroyView.as_view(),
        name="job_update",
    ),
    path("", views.JobListView.as_view(), name="job_list"),
    path("<int:pk>/", views.JobDetailView.as_view(), name="job_detail"),
]
