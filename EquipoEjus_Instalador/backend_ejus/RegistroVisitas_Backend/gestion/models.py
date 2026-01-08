from django.db import models
from django.utils import timezone

class Visitante(models.Model):
    # OPCIONES DE TIPO DE TRÁMITE
    TIPO_VISITA_CHOICES = [
        ('ASESORIA', 'Asesoría'),
        ('DIVORCIO_MUTUO_ACUERDO', 'Divorcio Mutuo Acuerdo'),
        ('DIVORCIO_POR_DESAFECTO', 'Divorcio por Desafecto'),
        ('CURATELA', 'Curatela'),
        ('TUTELA', 'Tutela'),
        ('DECLARACION_DE_UNICOS_HEREDERERO', 'Declaración de Únicos Herederos Universales'),
        ('MEDIDA_ANTICIPADA_PROHIBICION_SALIDA_PAIS', 'Medida Anticipada Prohibición Salida del País'),
        ('PERMISO_PARA_ESTUDIOS_MENORES', 'Permiso para Estudios Menores de edad en Instituciones de seguridad'),
        ('REGIMEN_MANUTENCION', 'Régimen de Manutención'),
        ('REGIMEN_CONVIVENCIA', 'Régimen de Convivencia'),
        ('CARTA_SOLTERIA', 'Carta de Soltería'),
        ('IMPUGNACION_DE_PATERNIDAD', 'Impugnación de Paternidad'),
        ('PERMISOS_DE_VIAJE', 'Permisos de Viajes'),
        ('TITULO_SUPLITORIO', 'Título Supletorio'),
        ('OTRO', 'Otro'),
    ]
    
    # OPCIONES DE INSTITUCIONES PARA REFERIR
    INSTITUCION_CHOICES = [
        ('MINISTERIO_PUBLICO', 'Ministerio Público'),
        ('DEFENSORIA_DEL_PUEBLO', 'Defensoría del Pueblo'),
        ('PREFECTURA', 'Prefectura'),
        ('JUECES_DE_PAZ', 'Jueces de Paz'),
        ('REGISTRO_INMOBILIARIO', 'Registro Inmobiliario'),
        ('REGISTRO_MERCANTIL', 'Registro Mercantil'),
        ('REGISTRO_PRINCIPAL', 'Registro Principal'),
        ('REGISTRO_CIVIL', 'Registro Civil'),
        ('NOTARIA_PUBLICA', 'Notaría Pública'),
        ('COMANDANCIA_POLICIA', 'Comandancia de la Policía'),
        ('CICPC', 'CICPC'),
        ('POLICIA_NACIONAL_BOLIVARIANA', 'Policía Nacional Bolivariana'),
        ('GOBERNACION', 'Gobernación'),
        ('ALCALDIA', 'Alcaldía'),
        ('DEFENSA_PUBLICA', 'Defensa Pública'),
        ('SENIAT', 'SENIAT'),
        ('SEMAT', 'SEMAT'),
        ('SUNDEE', 'SUNDEE'),
        ('SEMAMECF', 'SEMAMECF'),
        ('INAMUJER', 'INAMUJER'),
        ('URDD', 'URDD'),
        ('OAP', 'OAP'),
        ('TRIBUNAL_SUPREMO_JUSTICIA', 'Tribunal Supremo de Justicia (esta misma institución)'),
        ('OTRA_INSTITUCION', 'Otra Institución'),
        ('NO_REFERIDO', 'No requiere referir'),
    ]
    
    # CAMPOS DEL MODELO
    nombre = models.CharField(max_length=100, verbose_name="Nombre completo")
    # Allow multiple visit records for the same cédula (one person can visit multiple times)
    cedula = models.CharField(max_length=20, verbose_name="Cédula")
    # Persona FK: link multiple Visitante records to a single Persona (person registry)
    persona = models.ForeignKey(
        'Persona',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='visitas'
    )
    telefono = models.CharField(max_length=20, verbose_name="Teléfono", blank=True, null=True)
    
    # Información de ubicación
    municipio = models.CharField(max_length=100, verbose_name="Municipio", blank=True, null=True)
    parroquia = models.CharField(max_length=100, verbose_name="Parroquia", blank=True, null=True)
    direccion = models.TextField(verbose_name="Dirección completa", blank=True, null=True)
    
    # Información del trámite/consulta
    tipo_visita = models.CharField(
        max_length=80, 
        choices=TIPO_VISITA_CHOICES, 
        default='ASESORIA',
        verbose_name="Tipo de trámite solicitado"
    )
    
    # CAMPO PARA REFERIR A INSTITUCIÓN DONDE DEBE RESOLVER SU CASO
    referir_a = models.CharField(
        max_length=50,
        choices=INSTITUCION_CHOICES,
        default='NO_REFERIDO',
        verbose_name="Referir a institución para resolver el caso"
    )
    
    otra_institucion = models.CharField(
        max_length=100, 
        verbose_name="Especifique otra institución",
        blank=True, 
        null=True
    )
    
    fecha_hora_ingreso = models.DateTimeField(default=timezone.now, verbose_name="Fecha y hora de ingreso")
    fecha_hora_salida = models.DateTimeField(null=True, blank=True, verbose_name="Fecha y hora de salida")
    
    atencion_completada = models.BooleanField(default=False, verbose_name="Atención completada")
    
    observaciones = models.TextField(blank=True, verbose_name="Observaciones")
    historial = models.TextField(blank=True, verbose_name="Historial de cambios", null=True)
    
    # Campos de auditoría
    creado_en = models.DateTimeField(auto_now_add=True, verbose_name="Creado en")
    actualizado_en = models.DateTimeField(auto_now=True, verbose_name="Actualizado en")
    
    def __str__(self):
        return f"{self.nombre} - {self.cedula}"
    
    @property
    def nombre_completo(self):
        return self.nombre
    
    @property
    def duracion_atencion(self):
        """Calcula la duración de la atención si está completada"""
        if self.atencion_completada and self.fecha_hora_salida:
            duracion = self.fecha_hora_salida - self.fecha_hora_ingreso
            horas = duracion.total_seconds() // 3600
            minutos = (duracion.total_seconds() % 3600) // 60
            if horas > 0:
                return f"{int(horas)}h {int(minutos)}min"
            return f"{int(minutos)}min"
        return "En atención"
    
    @property
    def estado(self):
        """Retorna el estado de la atención"""
        return "Completado" if self.atencion_completada else "En proceso"
    
    @property
    def institucion_referida(self):
        """Retorna la institución a la que se refiere con formato"""
        if self.referir_a == 'OTRA_INSTITUCION' and self.otra_institucion:
            return self.otra_institucion
        return self.get_referir_a_display()
    
    @property
    def requiere_referir(self):
        """Indica si requiere ser referido a otra institución"""
        return self.referir_a != 'NO_REFERIDO'
    
    def registrar_salida(self):
        """Método para registrar salida del visitante"""
        if not self.atencion_completada:
            self.fecha_hora_salida = timezone.now()
            self.atencion_completada = True
            self.historial = f"{self.historial or ''}\n[Salida registrada: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}]"
            self.save()
            return True
        return False
    
    class Meta:
        ordering = ['-fecha_hora_ingreso']
        verbose_name = "Visitante"
        verbose_name_plural = "Visitantes"
        indexes = [
            models.Index(fields=['cedula']),
            models.Index(fields=['tipo_visita']),
            models.Index(fields=['referir_a']),
            models.Index(fields=['atencion_completada']),
            models.Index(fields=['fecha_hora_ingreso']),
            models.Index(fields=['municipio']),
            models.Index(fields=['persona']),
        ]


class Persona(models.Model):
    """Registry of persons so we can track multiple visits per person."""
    cedula = models.CharField(max_length=20, unique=True, verbose_name="Cédula")
    nombre = models.CharField(max_length=100, verbose_name="Nombre completo", blank=True)
    telefono = models.CharField(max_length=20, verbose_name="Teléfono", blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre or self.cedula} - {self.cedula}"

    class Meta:
        verbose_name = 'Persona'
        verbose_name_plural = 'Personas'
        indexes = [models.Index(fields=['cedula'])]