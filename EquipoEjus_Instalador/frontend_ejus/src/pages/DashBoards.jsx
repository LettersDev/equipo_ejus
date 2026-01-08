import React, { useState, useEffect } from 'react';
import Estadisticas from '../components/Estadisticas';
import { tsjService } from '../services/api';

const Dashboard = ({ setActiveTab }) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [visitantes, setVisitantes] = useState([]);
  const [visitantesActivos, setVisitantesActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del dashboard
  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas del dashboard
      const statsResponse = await tsjService.getEstadisticasDashboard();
      console.log('Estadísticas dashboard:', statsResponse.data);
        console.debug('Estadísticas dashboard:', statsResponse.data);
      // Cargar visitantes recientes (últimos 10)
      const visitantesResponse = await tsjService.getVisitantes({ 
        limit: 10,
        ordering: '-fecha_hora_ingreso'
      });
      console.log('Visitantes recientes:', visitantesResponse.data);
        console.debug('Visitantes recientes:', visitantesResponse.data);
      // Cargar visitantes activos (no completados)
      const activosResponse = await tsjService.getVisitantes({
        atencion_completada: false
      });

      // Actualizar estados
      setEstadisticas(statsResponse.data);
      setVisitantes(visitantesResponse.data.results || visitantesResponse.data);
      setVisitantesActivos(activosResponse.data.results || activosResponse.data);

    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError(`Error al cargar datos del dashboard: ${err.message || 'Error desconocido'}`);
      
      // Datos de ejemplo para testing
      setEstadisticas({
        total: 150,
        diario: 25,
        semanal: 120,
        mensual: 450,
        enSala: 8
      });
      
      setVisitantes([
        { id: 1, nombre: 'Juan Pérez', cedula: 'V12345678', tipo_visita: 'ASESORIA', estado: 'En proceso' },
        { id: 2, nombre: 'María González', cedula: 'V87654321', tipo_visita: 'DIVORCIO_MUTUO_ACUERDO', estado: 'Completado' }
      ]);
      
      setVisitantesActivos([
        { id: 1, nombre: 'Juan Pérez', cedula: 'V12345678', tipo_visita: 'ASESORIA' },
        { id: 3, nombre: 'Carlos Rodríguez', cedula: 'V11223344', tipo_visita: 'CURATELA' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  // Función para refrescar datos
  const handleRefresh = () => {
    cargarDatosDashboard();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos del dashboard...</p>
      </div>
    );
  }

  return (
    <Estadisticas 
      estadisticas={estadisticas}
      visitantes={visitantes}
      setActiveTab={setActiveTab}
      visitantesActivos={visitantesActivos}
      error={error}
      onRefresh={handleRefresh}
      loading={loading}
    />
  );
};

export default Dashboard;