class BasePermission:
    async def has_permission(self, scope):
        return True


class IsAuthenticated(BasePermission):
    async def has_permission(self, scope):
        return scope.get("user") and not scope["user"].is_anonymous


class AllowAny(BasePermission):
    async def has_permission(self, scope):
        return True


class IsStaff(BasePermission):
    async def has_permission(self, scope):
        return scope.get("user") and scope["user"].is_staff


class IsFreelancer(BasePermission):
    async def has_permission(self, scope):
        return (
            scope.get("user")
            and scope["user"].is_authenticated
            and scope["user"].is_freelancer()
        )


class IsClient(BasePermission):
    async def has_permission(self, scope):
        return (
            scope.get("user")
            and scope["user"].is_authenticated
            and scope["user"].is_client()
        )
