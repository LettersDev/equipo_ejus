import os
import sys
import django
from django.core.management import execute_from_command_line

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'RegistroVisitas_Backend.settings')

def main():
    django.setup()
    # Ejecuta el servidor en el puerto 8000
    execute_from_command_line(['manage.py', 'runserver', '127.0.0.1:8000', '--noreload'])

if __name__ == '__main__':
    main()