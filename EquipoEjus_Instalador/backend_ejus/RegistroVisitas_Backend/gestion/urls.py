from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework.views import APIView
from rest_framework.response import Response

router = DefaultRouter()
router.register(r'visitantes', views.VisitanteViewSet, basename='visitante')

urlpatterns = [
    # API CRUD de Visitantes
    path('', include(router.urls)),
    
    # Dashboard y Estadísticas en tiempo real
path('dashboard/estadisticas/', views.VisitanteViewSet.as_view({'get': 'estadisticas'}), name='dashboard-estadisticas'),    
    # Reportes analíticos
    path('reportes/tramites/', views.ReporteTramitesView.as_view(), name='reporte-tramites'),
    path('reportes/visitas-mensuales/', views.ReporteVisitasMensualesView.as_view(), name='reporte-visitas-mensuales'),
    path('reportes/tendencia-semanal/', views.ReporteTendenciaSemanalView.as_view(), name='reporte-tendencia-semanal'),
    path('reportes/estadisticas/', views.ReporteEstadisticasView.as_view(), name='reporte-estadisticas'),
    path('reportes/diario/', views.ReporteDiarioView.as_view(), name='reporte-diario'),
    
    # Nuevo: Reporte de referidos a instituciones
    path('reportes/referidos/', views.ReporteReferidosView.as_view(), name='reporte-referidos'),
    
    # Exportación de reportes
    path('reportes/exportar/pdf/', views.ExportarReportePDFView.as_view(), name='exportar-reporte-pdf'),
    path('reportes/exportar/excel/', views.ExportarReporteExcelView.as_view(), name='exportar-reporte-excel'),
    
    # Rutas adicionales para funcionalidades específicas
    path('visitantes/<int:pk>/registrar-salida/', 
         views.VisitanteViewSet.as_view({'post': 'registrar_salida'}), 
         name='registrar-salida'),
    
    # API para obtener opciones (útil para frontend)
    path('opciones/tipos-visita/', views.OpcionesTipoVisitaView.as_view(), name='opciones-tipos-visita'),
    path('opciones/instituciones/', views.OpcionesInstitucionesView.as_view(), name='opciones-instituciones'),
    path('opciones/municipios/', views.OpcionesMunicipiosView.as_view(), name='opciones-municipios'),
    
    # API para estadísticas específicas de referidos
    path('estadisticas/referidos/', views.EstadisticasReferidosView.as_view(), name='estadisticas-referidos'),
    # Autenticación (token)
    path('auth/login/', views.LoginView.as_view(), name='api-login'),
    path('auth/logout/', views.LogoutView.as_view(), name='api-logout'),
    path('auth/current/', views.CurrentUserView.as_view(), name='api-current-user'),
    path('auth/register/', views.RegisterView.as_view(), name='api-register'),
    # Update/version endpoints
    path('update/version/', views.version, name='api-version'),
    path('update/run/', views.update, name='api-update'),
]

# Si necesitas una vista para obtener opciones
