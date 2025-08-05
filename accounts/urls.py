from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views
from .views import clients as clients_views
from .views import freelancers as freelancers_views

app_name = "accounts"
urlpatterns = [
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", views.TokenVerifyView.as_view(), name="token_verify"),
    path("signin/", views.SigninView.as_view(), name="signin"),
    path(
        "signin-google/",
        views.SigninGoogleView.as_view(),
        name="signin_google",
    ),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path(
        "password-reset-mail/",
        views.PasswordResetMailView.as_view(),
        name="password_reset_mail",
    ),
    path(
        "otp-verify/",
        views.OTPVerifyView.as_view(),
        name="otp_verify",
    ),
    path(
        "password-reset/",
        views.PasswordResetView.as_view(),
        name="password_reset",
    ),
    path(
        "password-change/",
        views.PasswordChangeView.as_view(),
        name="password_change",
    ),
    path(
        "verify/email/<uidb64>/<token>/",
        views.EmailVerifyView.as_view(),
        name="verify_email",
    ),
    path(
        "resend/email/<uidb64>/<token>/",
        views.EmailResendView.as_view(),
        name="resend_email",
    ),
    # Freelancer specific URLs
    path("signup/", freelancers_views.SignupView.as_view(), name="signup"),
    path(
        "signup-google/",
        freelancers_views.SignupGoogleView.as_view(),
        name="signup_google",
    ),
    path(
        "accepted-domain/",
        freelancers_views.AcceptedDomainView.as_view(),
        name="accepted_domain",
    ),
    path("info/", freelancers_views.UserInfoView.as_view(), name="info"),
    # Retrieve user info by username endpoint
    path(
        "info/<str:username>/",
        freelancers_views.UserInfoByUsernameView.as_view(),
        name="info_by_username",
    ),
    # Client specific URLs
    path("clients/signup/", clients_views.SignupView.as_view(), name="clients_signup"),
    path(
        "clients/signup-google/",
        clients_views.SignupGoogleView.as_view(),
        name="clients_signup_google",
    ),
    path("clients/info/", clients_views.UserInfoView.as_view(), name="client_info"),
    # Retrieve client info by username endpoint
    path(
        "clients/info/<str:username>/",
        clients_views.ClientInfoByUsernameView.as_view(),
        name="client_info_by_username",
    ),
]
