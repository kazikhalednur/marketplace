from pathlib import Path

from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

JITSI_DOMAIN = config("JITSI_DOMAIN", cast=str)
JITSI_APP_ID = (
    open(BASE_DIR / config("JITSI_APP_ID_FILE", cast=str), "r").read().strip()
)
JITSI_APP_SECRET = (
    open(BASE_DIR / config("JITSI_APP_SECRET_FILE", cast=str), "r").read().strip()
)
JITSI_ISSUER = config("JITSI_ISSUER", cast=str)
JITSI_AUDIENCE = config("JITSI_AUDIENCE", cast=str)
