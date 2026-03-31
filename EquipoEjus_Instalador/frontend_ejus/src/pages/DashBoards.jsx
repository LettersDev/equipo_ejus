import React, { useEffect, useReducer } from 'react';
import Estadisticas from '../components/Estadisticas';
import { tsjService } from '../services/api';

const initialState = {
  estadisticas: null,
  visitantes: [],
  visitantesActivos: [],
  loading: true,
  error: null
};

function dashboardReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        estadisticas: action.payload.estadisticas,
        visitantes: action.payload.visitantes,
        visitantesActivos: action.payload.visitantesActivos
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

const Dashboard = ({ setActiveTab }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { estadisticas, visitantes, visitantesActivos, loading, error } = state;

  // Cargar datos del dashboard
  const cargarDatosDashboard = async () => {
    try {
      dispatch({ type: 'FETCH_START' });

      // Realizar llamadas en paralelo para mejorar rendimiento
      const [statsResponse, visitantesResponse, activosResponse] = await Promise.all([
        tsjService.getEstadisticasDashboard(),
        tsjService.getVisitantes({
          limit: 10,
          ordering: '-fecha_hora_ingreso'
        }),
        tsjService.getVisitantes({
          atencion_completada: false
        })
      ]);

      // Actualizar estados vía reducer
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          estadisticas: statsResponse.data,
          visitantes: visitantesResponse.data.results || visitantesResponse.data,
          visitantesActivos: activosResponse.data.results || activosResponse.data
        }
      });

    } catch (err) {
      console.error('Error cargando dashboard:', err);
      dispatch({ type: 'FETCH_ERROR', payload: `Error al cargar datos del dashboard: ${err.message || 'Error desconocido'}` });
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