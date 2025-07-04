from .base import *

# email configuration
EMAIL_BACKEND = config("EMAIL_BACKEND")
EMAIL_HOST = config("EMAIL_HOST")
EMAIL_HOST_USER = config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = config("EMAIL_USE_TLS", cast=bool)
EMAIL_PORT = config("EMAIL_PORT", cast=int)
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL")
SUPPORT_EMAIL = config("SUPPORT_EMAIL")
