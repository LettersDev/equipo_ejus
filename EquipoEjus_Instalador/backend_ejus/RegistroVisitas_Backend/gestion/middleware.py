"""
Middleware para capturar la IP del cliente y el usuario actual
y ponerlos disponibles en thread-local para los signals de auditoría.
"""

import threading

_thread_locals = threading.local()


def get_current_ip():
    """Retorna la IP capturada por el middleware, o None."""
    return getattr(_thread_locals, 'ip', None)


def get_current_user():
    """Retorna el nombre de usuario capturado por el middleware, o None."""
    return getattr(_thread_locals, 'current_user', None)


def set_current_user(username):
    """Permite a las vistas guardar el usuario actual en thread-local."""
    _thread_locals.current_user = username


class AuditIPMiddleware:
    """
    Middleware que:
    1. Extrae la IP real del cliente (soporta X-Forwarded-For).
    2. Guarda el usuario autenticado (si lo hay) en thread-local.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Extraer IP
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            ip = x_forwarded.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        _thread_locals.ip = ip

        # Guardar usuario autenticado (si existe)
        user = getattr(request, 'user', None)
        if user and getattr(user, 'is_authenticated', False):
            _thread_locals.current_user = user.get_full_name() or user.username
        else:
            _thread_locals.current_user = None

        response = self.get_response(request)
        return response
