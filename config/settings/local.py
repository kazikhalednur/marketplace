from datetime import timedelta

from .base import *

AUTH_PASSWORD_VALIDATORS = []


STATIC_ROOT = BASE_DIR / "static"
MEDIA_ROOT = BASE_DIR / "uploads"

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


REST_FRAMEWORK.update(
    {
        "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    }
)


SIMPLE_JWT.update({"ACCESS_TOKEN_LIFETIME": timedelta(days=30)})


INTERNAL_IPS = [
    "127.0.0.1",
]

if not TESTING:
    INSTALLED_APPS = [
        *INSTALLED_APPS,
        "debug_toolbar",
    ]
    MIDDLEWARE = [
        "debug_toolbar.middleware.DebugToolbarMiddleware",
        *MIDDLEWARE,
    ]
