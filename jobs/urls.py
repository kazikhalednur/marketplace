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
    path("jobs/", views.JobListView.as_view(), name="job_list"),
    path("jobs/<int:pk>/", views.JobDetailView.as_view(), name="job_detail"),
]
