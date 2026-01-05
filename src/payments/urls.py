from django.urls import path

from . import views

app_name = "payments"

urlpatterns = [
    path("ipn-validate/", views.IPNValidatePaymentView.as_view(), name="ipn_validate"),
]
