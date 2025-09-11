from django.urls import include, path

from .views import client as client_views
from .views import freelancer as freelancer_views

client_urls = [
    path(
        "proposals/update/<uuid:proposal_id>/",
        client_views.ProposalUpdateView.as_view(),
        name="client-proposal-update",
    ),
    path(
        "proposals/<uuid:job_id>/",
        client_views.ProposalListlView.as_view(),
        name="client-proposal-list",
    ),
    path(
        "contracts/",
        client_views.ContractListView.as_view(),
        name="client-contract-list",
    ),
    path(
        "contracts/<uuid:contract_id>/",
        client_views.ContractDetailView.as_view(),
        name="client-contract-detail",
    ),
]


urlpatterns = [
    path(
        "proposals/",
        freelancer_views.ProposalListCreateView.as_view(),
        name="proposal-list-create",
    ),
    path(
        "proposals/<uuid:id>/",
        freelancer_views.ProposalDetailView.as_view(),
        name="proposal-detail",
    ),
    path(
        "contracts/",
        freelancer_views.ContractListView.as_view(),
        name="freelancer-contract-list",
    ),
    path(
        "contracts/<uuid:contract_id>/",
        freelancer_views.ContractDetailView.as_view(),
        name="freelancer-contract-detail",
    ),
    path("client/", include(client_urls)),
]
