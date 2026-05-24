from .base import *

# Sandbox credentials only work against sandbox URLs (and vice versa).
# PAYSTATION_ENV selects the URL pair; do not set PAYSTATION_INITIATE_URL in .env.
PAYSTATION_ENV = config("PAYSTATION_ENV", default="sandbox").strip().lower()

from config.paystation import paystation_urls

PAYSTATION_INITIATE_URL, PAYSTATION_TRANSACTION_STATUS_URL = paystation_urls(
    PAYSTATION_ENV
)

REST_FRAMEWORK.update(
    {
        "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    }
)
SIMPLE_JWT.update({"ACCESS_TOKEN_LIFETIME": timedelta(days=30)})
