from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "CHECK_REVOKE_TOKEN": True,
    "AUTH_COOKIE": "access_token",  # Cookie name. Enables cookies if value is set.
    "AUTH_COOKIE_DOMAIN": None,  # A string like "example.com", or None for standard domain cookie.
    "AUTH_COOKIE_SECURE": False,  # Whether the auth cookies should be secure (https:// only).
    "AUTH_COOKIE_HTTP_ONLY": True,  # Http only cookie flag.It's not fetch by javascript.
    "AUTH_COOKIE_PATH": "/",  # The path of the auth cookie.
    "AUTH_COOKIE_SAMESITE": "Lax",  # Whether to set the flag restricting cookie leaks on cross-site requests.
    # This can be 'Lax', 'Strict', or None to disable the flag.
}
