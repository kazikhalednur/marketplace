from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()


@database_sync_to_async
def get_user(validated_token):
    try:
        jwt_auth = JWTAuthentication()
        return jwt_auth.get_user(validated_token)
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Default to anonymous
        scope["user"] = AnonymousUser()

        # Extract headers and normalize them
        headers = dict(
            (k.decode("latin1"), v.decode("latin1"))
            for k, v in scope.get("headers", [])
        )

        auth_header = headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[1]
            try:
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
            except (InvalidToken, TokenError):
                pass  # Invalid token: leave user as AnonymousUser
        else:
            query_string = scope.get("query_string", b"").decode()
            query_params = parse_qs(query_string)
            token = query_params.get("token", [None])[0]
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)

        if validated_token:
            scope["user"] = await get_user(validated_token)

        return await super().__call__(scope, receive, send)
