#!/usr/bin/env python
import os
import django
import logging
from django.db import transaction, IntegrityError

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'RegistroVisitas_Backend.settings')
django.setup()

from gestion.models import Visitante, Persona

logger = logging.getLogger(__name__)

def run():
    cedulas = Visitante.objects.values_list('cedula', flat=True).distinct()
    created = 0
    linked = 0
    for c in cedulas:
        if not c:
            continue
        try:
            with transaction.atomic():
                persona, pcreated = Persona.objects.get_or_create(cedula=c)
            if pcreated:
                # populate nombre/telefono from first matching visitante
                v = Visitante.objects.filter(cedula=c).first()
                if v:
                    persona.nombre = v.nombre
                    persona.telefono = v.telefono or ''
                    persona.save()
                created += 1
        except IntegrityError:
            try:
                persona = Persona.objects.get(cedula=c)
            except Persona.DoesNotExist:
                logger.exception('IntegrityError but persona not found for cedula %s', c)
                continue
        except Exception as e:
            logger.exception('Error procesando cedula %s: %s', c, e)
            continue
        # link all visitantes with this cedula to persona
        qs = Visitante.objects.filter(cedula=c).exclude(persona=persona)
        for v in qs:
            v.persona = persona
            v.save()
            linked += 1

    print(f'Personas creadas: {created}, Visitantes enlazados: {linked}')

if __name__ == '__main__':
    run()
