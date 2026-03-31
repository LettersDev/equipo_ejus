from django.apps import AppConfig


class GestionConfig(AppConfig):
    name = 'gestion'

    def ready(self):
        import gestion.signals  # noqa: F401 — conecta los signals de auditoría
