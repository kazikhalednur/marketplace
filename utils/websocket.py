# consumers/base.py

import json

from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from .permissions import AllowAny


class BaseAuthConsumer(AsyncWebsocketConsumer):
    permission_classes = [AllowAny]  # default

    async def connect(self):
        user = self.scope.get("user")
        if user and isinstance(user, AnonymousUser):
            for permission in self.permission_classes:
                permission_instance = permission()
                if not await permission_instance.has_permission(self.scope):
                    await self.accept()
                    await self.send_json({"error": "Authentication required"})
                    await self.close(code=4003)
                    return

        # Proceed with normal permission checks
        if await self.check_permissions():
            await self.accept()
            # Mark that connection was accepted
            self.scope["_connection_accepted"] = True
            # Call custom connect method if it exists
            if hasattr(self, "custom_connect"):
                await self.custom_connect()
        else:
            await self.accept()
            await self.handle_unauthorized()

    async def check_permissions(self):
        for permission in self.permission_classes:
            permission_instance = permission()
            if not await permission_instance.has_permission(self.scope):
                return False
        return True

    async def handle_unauthorized(self):
        """Default unauthorized behavior"""
        await self.send_json({"message": "Unauthorized"})
        await self.close(code=4003)

    async def send_json(self, data):
        await self.send(text_data=json.dumps(data))
