from rest_framework import serializers
from .models import Visitante
import logging

logger = logging.getLogger(__name__)

class VisitanteSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()
    duracion_atencion = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()
    institucion_referida = serializers.SerializerMethodField()
    requiere_referir = serializers.SerializerMethodField()
    visit_count = serializers.SerializerMethodField()
    persona = serializers.SerializerMethodField()
    
    class Meta:
        model = Visitante
        fields = [
            'id',
            'nombre',
            'nombre_completo',
            'cedula',
            'telefono',
            'municipio',
            'parroquia',
            'direccion',
            'tipo_visita',
            'referir_a',
            'otra_institucion',
            'institucion_referida',
            'requiere_referir',
            'fecha_hora_ingreso',
            'fecha_hora_salida',
            'atencion_completada',
            'duracion_atencion',
            'estado',
            'observaciones',
            'historial',
            'visit_count',
            'persona',
            'creado_por',
            'actualizado_por',
            'creado_en',
            'actualizado_en'
        ]
        read_only_fields = [
            'fecha_hora_ingreso', 
            'fecha_hora_salida', 
            'historial',
            'creado_por',
            'actualizado_por',
            'creado_en',
            'actualizado_en'
        ]
    
    def get_nombre_completo(self, obj):
        return obj.nombre
    
    def get_duracion_atencion(self, obj):
        return obj.duracion_atencion
    
    def get_estado(self, obj):
        return obj.estado
    
    def get_institucion_referida(self, obj):
        return obj.institucion_referida
    
    def get_requiere_referir(self, obj):
        return obj.requiere_referir

    def get_visit_count(self, obj):
        # Prefer annotated value to avoid extra queries
        try:
            if hasattr(obj, 'visit_count'):
                return getattr(obj, 'visit_count') or 0
            if getattr(obj, 'persona', None):
                return obj.persona.visitas.count()
            return Visitante.objects.filter(cedula=obj.cedula).count()
        except Exception as e:
            logger.exception('Error calculando visit_count: %s', e)
            return 0

    def get_persona(self, obj):
        p = getattr(obj, 'persona', None)
        if not p:
            return None
        return {
            'id': p.id,
            'cedula': p.cedula,
            'nombre': p.nombre,
            'telefono': p.telefono,
            'creado_en': p.creado_en,
            'visit_count': p.visitas.count()
        }

    # Extract creator and last updater from the historial text
    creado_por = serializers.SerializerMethodField()
    actualizado_por = serializers.SerializerMethodField()

    def get_creado_por(self, obj):
        if not obj.historial:
            return None
        # buscar la primera ocurrencia de 'Creado por:'
        for line in (obj.historial or '').splitlines():
            if 'Creado por:' in line:
                try:
                    return line.split('Creado por:')[1].strip()
                except Exception as e:
                    logger.exception('Error extrayendo creado_por: %s', e)
                    return line.strip()
        return None

    def get_actualizado_por(self, obj):
        if not obj.historial:
            return None
        # buscar la última ocurrencia de 'Actualizado por:'
        lines = [l for l in (obj.historial or '').splitlines() if 'Actualizado por:' in l]
        if lines:
            try:
                return lines[-1].split('Actualizado por:')[1].strip()
            except Exception as e:
                logger.exception('Error extrayendo actualizado_por: %s', e)
                return lines[-1].strip()
        return None
    
    def validate_cedula(self, value):
        """Validación personalizada para cédula"""
        if len(value) < 6 or len(value) > 20:
            raise serializers.ValidationError("La cédula debe tener entre 6 y 20 caracteres")
        return value
    
    def validate(self, data):
        """Validación personalizada para referir_a"""
        referir_a = data.get('referir_a', 'NO_REFERIDO')
        otra_institucion = data.get('otra_institucion', '')
        
        if referir_a == 'OTRA_INSTITUCION' and not otra_institucion:
            raise serializers.ValidationError({
                'otra_institucion': 'Debe especificar la otra institución'
            })
        
        return data

class EstadisticasSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    diario = serializers.IntegerField()
    semanal = serializers.IntegerField()
    mensual = serializers.IntegerField()
    enSala = serializers.IntegerField()

class DashboardSerializer(serializers.Serializer):
    totales = serializers.DictField()
    hoy = serializers.DictField()
    tiempo_promedio_atencion = serializers.CharField()
    metrica_semanal = serializers.DictField()

class ReporteTramitesSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    periodo = serializers.CharField()
    descripcion_periodo = serializers.CharField()
    rango_fechas = serializers.DictField()
    totales = serializers.DictField()
    datos = serializers.ListField()
    metadata = serializers.DictField()

class ReporteMensualSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    configuracion = serializers.DictField()
    tendencia_general = serializers.FloatField()
    datos = serializers.ListField()
    resumen = serializers.DictField()

class ReporteSemanalSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    configuracion = serializers.DictField()
    tendencia = serializers.DictField()
    datos = serializers.ListField()
    resumen = serializers.DictField()

class ReporteEstadisticasCompletasSerializer(serializers.Serializer):
    totales = serializers.DictField()
    porcentajes = serializers.DictField()
    promedios = serializers.DictField()
    principales = serializers.DictField()
    tendencias = serializers.DictField()
    distribuciones = serializers.DictField()
    informacion_sistema = serializers.DictField()

class ReporteEstadisticasResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    estadisticas = ReporteEstadisticasCompletasSerializer()
    metadata = serializers.DictField()

# Serializer para exportación
class VisitanteExportSerializer(serializers.ModelSerializer):
    tipo_visita_display = serializers.CharField(source='get_tipo_visita_display')
    referir_a_display = serializers.CharField(source='get_referir_a_display')
    estado = serializers.SerializerMethodField()
    requiere_referir = serializers.SerializerMethodField()
    
    class Meta:
        model = Visitante
        fields = [
            'cedula',
            'nombre',
            'telefono',
            'municipio',
            'parroquia',
            'tipo_visita_display',
            'referir_a_display',
            'otra_institucion',
            'fecha_hora_ingreso',
            'fecha_hora_salida',
            'estado',
            'requiere_referir',
            'observaciones'
        ]
    
    def get_estado(self, obj):
        return "Completado" if obj.atencion_completada else "En proceso"
    
    def get_requiere_referir(self, obj):
        return "Sí" if obj.requiere_referir else "No"

# Serializers para estadísticas de referidos
class ReferidoEstadisticasSerializer(serializers.Serializer):
    institucion = serializers.CharField()
    total_referidos = serializers.IntegerField()
    porcentaje = serializers.FloatField()
    tramites_comunes = serializers.ListField()

class ReferidosReporteSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    periodo = serializers.CharField()
    total_visitantes = serializers.IntegerField()
    total_referidos = serializers.IntegerField()
    porcentaje_referidos = serializers.FloatField()
    instituciones = ReferidoEstadisticasSerializer(many=True)
    metadata = serializers.DictField()