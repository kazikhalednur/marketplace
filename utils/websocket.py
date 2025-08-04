# consumers/base.py

import json

from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from .permissions import AllowAny


class BaseAuthConsumer(AsyncWebsocketConsumer):
    permission_classes = [AllowAny]  # default

    # HTTP to WebSocket status code mapping
    STATUS_CODES = {
        200: None,  # Success - no close needed
        201: None,  # Created - send confirmation
        204: None,  # No Content - send empty or ignore
        400: 3000,  # Bad Request - Application specific
        401: 3001,  # Unauthorized - Application specific
        403: 3002,  # Forbidden - Application specific
        404: 3003,  # Not Found - Application specific
        409: 3004,  # Conflict - Application specific
        413: 3005,  # Payload Too Large - Application specific
        426: 3006,  # Upgrade Required - Application specific
        429: 3007,  # Too Many Requests - Application specific
        500: 3008,  # Internal Server Error - Application specific
        503: 3009,  # Service Unavailable - Application specific
    }

    async def connect(self):
        # Check permissions and handle accordingly
        permission_result = await self.check_permissions_with_details()

        if permission_result["allowed"]:
            await self.accept()
            self.scope["_connection_accepted"] = True
            if hasattr(self, "custom_connect"):
                await self.custom_connect()
        else:
            await self.accept()
            await self.send_json(
                {
                    "success": False,
                    "status_code": permission_result["code"],
                    "message": permission_result["message"],
                }
            )
            await self.close(code=permission_result["code"])

    async def check_permissions_with_details(self):
        """Check permissions and return detailed result"""
        user = self.scope.get("user")

        # Handle anonymous users
        if user is None or isinstance(user, AnonymousUser):
            for permission in self.permission_classes:
                permission_instance = permission()
                if not isinstance(permission_instance, AllowAny):
                    return {
                        "allowed": False,
                        "message": "Authentication required",
                        "code": self.STATUS_CODES[401],  # 3001
                    }

        # Check all permissions for authenticated users
        for permission in self.permission_classes:
            permission_instance = permission()
            if not await permission_instance.has_permission(self.scope):
                return {
                    "allowed": False,
                    "message": "Permission denied",
                    "code": self.STATUS_CODES[403],  # 3002
                }

        return {"allowed": True}

    async def send_json(self, data):
        await self.send(text_data=json.dumps(data))

    async def send_success_response(self, data=None, status_code=200):
        """Send success response"""
        if status_code == 201:
            # Resource created
            response = {"success": True, "status": "created"}
            if data:
                response.update(data)
        elif status_code == 204:
            # No content - send empty message
            await self.send(text_data="")
            return
        else:
            # Default success response
            response = {"success": True, "status_code": status_code}
            if data:
                response.update(data)

        await self.send_json(response)

    async def send_error_response(
        self, message, http_status_code, close_connection=True
    ):
        """Send error response with proper WebSocket status code"""
        ws_status_code = self.STATUS_CODES.get(http_status_code, 3000)

        error_response = {
            "success": False,
            "status_code": http_status_code,
            "message": message,
        }

        await self.send_json(error_response)

        if close_connection and ws_status_code:
            await self.close(code=ws_status_code)

    async def handle_bad_request(self, message="Invalid request"):
        """Handle 400 Bad Request"""
        await self.send_error_response(message, 400)

    async def handle_unauthorized(self, message="Authentication required"):
        """Handle 401 Unauthorized"""
        await self.send_error_response(message, 401)

    async def handle_forbidden(self, message="Permission denied"):
        """Handle 403 Forbidden"""
        await self.send_error_response(message, 403)

    async def handle_not_found(self, message="Resource not found"):
        """Handle 404 Not Found"""
        await self.send_error_response(message, 404, close_connection=False)

    async def handle_conflict(self, message="Resource conflict"):
        """Handle 409 Conflict"""
        await self.send_error_response(message, 409)

    async def handle_payload_too_large(self, message="Payload too large"):
        """Handle 413 Payload Too Large"""
        await self.send_error_response(message, 413)

    async def handle_rate_limit(self, message="Too many requests"):
        """Handle 429 Too Many Requests"""
        await self.send_error_response(message, 429)

    async def handle_server_error(self, message="Internal server error"):
        """Handle 500 Internal Server Error"""
        await self.send_error_response(message, 500)

    async def handle_service_unavailable(
        self, message="Service temporarily unavailable"
    ):
        """Handle 503 Service Unavailable"""
        await self.send_error_response(message, 503)
