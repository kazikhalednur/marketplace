from django.urls import path

from .views import client as client_views
from .views import freelancer as freelancer_views

urlpatterns = [
    path(
        "proposals/", freelancer_views.ProposalListView.as_view(), name="proposal-list"
    ),
    path(
        "proposals/<uuid:id>/",
        freelancer_views.ProposalDetailView.as_view(),
        name="proposal-detail",
    ),
    path(
        "client/proposals/update/<uuid:proposal_id>/",
        client_views.ProposalUpdateView.as_view(),
        name="client-proposal-update",
    ),
    path(
        "client/proposals/<uuid:job_id>/",
        client_views.ProposalListlView.as_view(),
        name="client-proposal-list",
    ),
]
