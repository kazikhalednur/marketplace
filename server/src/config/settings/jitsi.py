from decouple import config

JITSI_DOMAIN = config("JITSI_DOMAIN", cast=str)
JITSI_APP_ID = config("JITSI_APP_ID", cast=str)
JITSI_APP_SECRET = config("JITSI_APP_SECRET", cast=str)
JITSI_ISSUER = config("JITSI_ISSUER", cast=str)
JITSI_AUDIENCE = config("JITSI_AUDIENCE", cast=str)
