from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views
from .views import freelancers as freelancers_views

app_name = "accounts"
urlpatterns = [
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", views.TokenVerifyView.as_view(), name="token_verify"),
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
    # Freelancer specific URLs
    path("signup/", freelancers_views.SignupView.as_view(), name="signup"),
    path(
        "verify/email/<uidb64>/<token>/",
        freelancers_views.SignupVerifyView.as_view(),
        name="verify_email",
    ),
    path(
        "signup-google/",
        freelancers_views.SignupGoogleView.as_view(),
        name="signup_google",
    ),
    path("signin/", freelancers_views.SigninView.as_view(), name="signin"),
    path(
        "signin-google/",
        freelancers_views.SigninGoogleView.as_view(),
        name="signin_google",
    ),
    path("info/", freelancers_views.UserInfoView.as_view(), name="info"),
    path(
        "accepted-domain",
        freelancers_views.AcceptedDomainView.as_view(),
        name="accepted_domain",
    ),
]
