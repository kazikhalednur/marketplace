REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ("utils.helpers.JSONRenderer",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}
