from django.urls import include, path

from .views import client as client_views
from .views import freelancer as freelancer_views

app_name = "work_diary"

# Client URLs
client_urls = [
    path(
        "milestones/stats/",
        client_views.MilestoneStatsView.as_view(),
        name="client-milestone-stats",
    ),
    path(
        "milestones/<uuid:contract_id>/",
        client_views.MilestoneDetailView.as_view(),
        name="client-milestone-detail",
    ),
    path(
        "milestones/<uuid:contract_id>/steps/",
        client_views.MilestoneStepListCreateView.as_view(),
        name="client-milestone-step-list-create",
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
        freelancer_views.MilestoneStepUpdateView.as_view(),
        name="freelancer-milestone-step",
    ),
]

urlpatterns = [
    path("client/", include(client_urls)),
    path("", include(freelancer_urls)),
]
