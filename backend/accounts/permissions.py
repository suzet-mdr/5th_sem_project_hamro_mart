from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Allows access only to Admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsManagerOrAbove(BasePermission):
    """
    Allows access to Manager or Admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['admin', 'manager'])

class IsStaff(BasePermission):
    """
    Allows access to any staff, manager, or admin user.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['admin', 'manager', 'staff'])
