from django.urls import path

from . import views

app_name = "payments"

urlpatterns = [
    path("job/", views.JobPaymentView.as_view(), name="job"),
    path("callback/", views.CallbackPaymentView.as_view(), name="callback"),
    path(
        "status/<invoice_number>/",
        views.StatusByInvoiceNumberView.as_view(),
        name="status",
    ),
]
