"""
Signals de auditoría para el modelo Visitante.
Registra CREATE, UPDATE y DELETE en el modelo AuditLog.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


@receiver(post_save, sender='gestion.Visitante')
def visitante_guardado(sender, instance, created, **kwargs):
    """Registra la creación o actualización de un Visitante."""
    # Evitar doble registro: si el flag _skip_audit está activo, no registrar
    if getattr(instance, '_skip_audit', False):
        return

    from .models import AuditLog
    from .middleware import get_current_ip, get_current_user

    # Intentar obtener usuario de thread-local o del objeto directamente
    usuario = get_current_user()
    if not usuario and hasattr(instance, '_current_user'):
        usuario = instance._current_user

    accion = 'CREATE' if created else 'UPDATE'
    verbo = 'Creó' if created else 'Actualizó'

    AuditLog.objects.create(
        usuario=usuario,
        accion=accion,
        modulo='Visitante',
        objeto_id=instance.pk,
        descripcion=(
            f'{verbo} visitante: {instance.nombre} '
            f'(Cédula: {instance.cedula}) — ID {instance.pk}'
        ),
        ip=get_current_ip(),
    )


@receiver(post_delete, sender='gestion.Visitante')
def visitante_eliminado(sender, instance, **kwargs):
    """Registra la eliminación de un Visitante."""
    from .models import AuditLog
    from .middleware import get_current_ip, get_current_user

    # Intentar obtener usuario de thread-local o del objeto directamente
    usuario = get_current_user()
    if not usuario and hasattr(instance, '_current_user'):
        usuario = instance._current_user

    AuditLog.objects.create(
        usuario=usuario,
        accion='DELETE',
        modulo='Visitante',
        objeto_id=instance.pk,
        descripcion=(
            f'Eliminó visitante: {instance.nombre} '
            f'(Cédula: {instance.cedula}) — ID {instance.pk}'
        ),
        ip=get_current_ip(),
    )
