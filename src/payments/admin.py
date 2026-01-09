from django.contrib import admin

from .models import (
    PaymentCallbackLog,
    PaymentHistory,
    PaymentRequest,
    PaymentTransaction,
)

admin.site.register(PaymentHistory)
admin.site.register(PaymentRequest)
admin.site.register(PaymentTransaction)
admin.site.register(PaymentCallbackLog)
