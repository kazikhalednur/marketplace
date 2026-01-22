from .base import *

REST_FRAMEWORK.update(
    {
        "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    }
)
SIMPLE_JWT.update({"ACCESS_TOKEN_LIFETIME": timedelta(days=30)})
