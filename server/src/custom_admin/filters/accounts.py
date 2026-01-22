import django_filters

from accounts.models import (
    OTP,
    Arbitrator,
    Auditor,
    Client,
    ClientProfile,
    Freelancer,
    FreelancerProfile,
    User,
    WebSocketID,
)


class UserAdminFilter(django_filters.FilterSet):
    role = django_filters.ChoiceFilter(
        field_name="role",
        choices=User.UserRole.choices,
        lookup_expr="exact",
    )
    is_staff = django_filters.BooleanFilter(field_name="is_staff")
    email_verified = django_filters.BooleanFilter(field_name="email_verified")
    is_google_login = django_filters.BooleanFilter(field_name="is_google_login")

    class Meta:
        model = User
        fields = ["role", "is_staff", "email_verified", "is_google_login"]


class ClientAdminFilter(django_filters.FilterSet):
    is_staff = django_filters.BooleanFilter(field_name="is_staff")
    email_verified = django_filters.BooleanFilter(field_name="email_verified")

    class Meta:
        model = Client
        fields = ["is_staff", "email_verified"]


class FreelancerAdminFilter(django_filters.FilterSet):
    is_staff = django_filters.BooleanFilter(field_name="is_staff")
    email_verified = django_filters.BooleanFilter(field_name="email_verified")

    class Meta:
        model = Freelancer
        fields = ["is_staff", "email_verified"]


class ClientProfileAdminFilter(django_filters.FilterSet):
    client = django_filters.UUIDFilter(field_name="client", lookup_expr="exact")

    class Meta:
        model = ClientProfile
        fields = ["client"]


class FreelancerProfileAdminFilter(django_filters.FilterSet):
    freelancer = django_filters.UUIDFilter(field_name="freelancer", lookup_expr="exact")

    class Meta:
        model = FreelancerProfile
        fields = ["freelancer"]


class OTPAdminFilter(django_filters.FilterSet):
    user = django_filters.UUIDFilter(field_name="user", lookup_expr="exact")

    class Meta:
        model = OTP
        fields = ["user"]


class WebSocketIDAdminFilter(django_filters.FilterSet):
    user = django_filters.UUIDFilter(field_name="user", lookup_expr="exact")

    class Meta:
        model = WebSocketID
        fields = ["user"]


class ArbitratorAdminFilter(django_filters.FilterSet):
    is_staff = django_filters.BooleanFilter(field_name="is_staff")

    class Meta:
        model = Arbitrator
        fields = ["is_staff"]


class AuditorAdminFilter(django_filters.FilterSet):
    is_staff = django_filters.BooleanFilter(field_name="is_staff")

    class Meta:
        model = Auditor
        fields = ["is_staff"]
