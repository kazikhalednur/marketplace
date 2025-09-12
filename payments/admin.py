from django.contrib import admin

from .models import InitiatePayment, IPNValidatePayment, SSLCommerzConfig


@admin.register(InitiatePayment)
class InitiatePaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "tran_id",
        "user",
        "total_amount",
        "currency",
        "status",
        "created_at",
        "updated_at",
    )
    search_fields = ("user__username", "user__email")
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(IPNValidatePayment)
class IPNValidatePaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "initiate_payment", "status", "created_at", "updated_at")
    search_fields = (
        "initiate_payment__tran_id",
        "initiate_payment__user__username",
        "initiate_payment__user__email",
    )
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(SSLCommerzConfig)
class SSLCommerzConfigAdmin(admin.ModelAdmin):
    list_display = ("name", "environment", "is_active", "created_at", "updated_at")
    readonly_fields = ("id", "created_at", "updated_at")
