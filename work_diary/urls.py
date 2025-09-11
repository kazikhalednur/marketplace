from django.urls import include, path

from .views import client as client_views
from .views import freelancer as freelancer_views

app_name = "work_diary"

# Client URLs
client_urls = [
    path(
        "milestones/<uuid:contract_id>/",
        client_views.MilestoneDetailView.as_view(),
        name="client-milestone-detail",
    ),
    path(
        "milestones/<uuid:contract_id>/steps/",
        client_views.MilestoneStepListView.as_view(),
        name="client-milestone-step-list",
    ),
    path(
        "milestones/<uuid:contract_id>/steps/create/",
        client_views.MilestoneStepCreateView.as_view(),
        name="client-milestone-step-create",
    ),
    path(
        "milestones/<uuid:contract_id>/steps/swap/",
        client_views.MilestoneStepSwapView.as_view(),
        name="client-milestone-step-swap",
    ),
    path(
        "milestones/<uuid:contract_id>/steps/<uuid:step_id>/",
        client_views.MilestoneStepDetailView.as_view(),
        name="client-milestone-step-detail",
    ),
    path(
        "milestones/<uuid:contract_id>/steps/<uuid:step_id>/submissions/<uuid:submission_id>/update/",  # noqa: E501
        client_views.MilestoneStepSubmissionUpdateView.as_view(),
        name="client-milestone-step-submission-update",
    ),
]

# Freelancer URLs
freelancer_urls = [
    path(
        "milestones/<uuid:contract_id>/",
        freelancer_views.MilestoneDetailView.as_view(),
        name="freelancer-milestone-detail",
    ),
    path(
        "milestones/<uuid:contract_id>/steps/",
        freelancer_views.MilestoneStepListView.as_view(),
        name="freelancer-milestone-step-list",
    ),
    path(
        "milestones/<uuid:contract_id>/steps/<uuid:step_id>/",
        freelancer_views.MilestoneStepDetailView.as_view(),
        name="freelancer-milestone-step-detail",
    ),
    path(
        "milestones/<uuid:contract_id>/steps/<uuid:step_id>/submissions/",
        freelancer_views.MilestoneStepSubmissionView.as_view(),
        name="freelancer-milestone-step-submission",
    ),
]

urlpatterns = [
    path("client/", include(client_urls)),
    path("", include(freelancer_urls)),
]
