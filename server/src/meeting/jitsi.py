import time

import jwt
from django.conf import settings


def generate_jitsi_token(user, room, is_creator=False):
    payload = {
        "iss": settings.JITSI_ISSUER,
        "aud": settings.JITSI_AUDIENCE,
        "sub": settings.JITSI_DOMAIN,
        "room": room,
        "exp": int(time.time()) + 3600,
        "context": {
            "user": {
                "name": user.get_full_name(),
                "email": user.email,
                "moderator": is_creator,
            }
        },
        "features": {"recording": True},
    }
    return jwt.encode(payload, settings.JITSI_APP_SECRET, algorithm="HS256")
