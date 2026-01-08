import React from 'react';
import { Users, Calendar, BarChart3, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const Estadisticas = ({ 
  estadisticas, 
  visitantes, 
  setActiveTab, 
  visitantesActivos,
  error,
  onRefresh,
   
}) => {
  
  // Si no hay estadísticas, mostrar mensaje de error o loading
  if (!estadisticas) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <AlertCircle size={48} color="#f59e0b" />
          <h3>No hay datos disponibles</h3>
          <p>No se pudieron cargar las estadísticas del dashboard.</p>
          {onRefresh && (
            <button className="btn-primary" onClick={onRefresh}>
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {error && (
        <div className="alert alert-warning">
          <AlertCircle size={20} />
          <span>{error}</span>
          {onRefresh && (
            <button className="btn-outline" onClick={onRefresh}>
              Reintentar
            </button>
          )}
        </div>
      )}
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Visitantes</h3>
            <p className="stat-number">{estadisticas.total || 0}</p>
            <p className="stat-change">
              {estadisticas.diario ? `+${estadisticas.diario} hoy` : 'Sin datos hoy'}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>En Instalaciones</h3>
            <p className="stat-number">{visitantesActivos?.length || estadisticas.enSala || 0}</p>
            <p className="stat-change">Activos ahora</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon today">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>Visitas Hoy</h3>
            <p className="stat-number">{estadisticas.diario || 0}</p>
            <p className="stat-change">Este día</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon weekly">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3>Esta Semana</h3>
            <p className="stat-number">{estadisticas.semanal || 0}</p>
            <p className="stat-change">
              <TrendingUp size={14} /> 
              {estadisticas.semanal && estadisticas.mensual ? 
                `${Math.round((estadisticas.semanal / estadisticas.mensual) * 100)}% del mes` : 
                'Sin datos comparativos'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <div className="section-header">
          <h2><Clock size={20} /> Actividad Reciente</h2>
          <button className="btn-outline" onClick={() => setActiveTab('registros')}>
            Ver todos
          </button>
        </div>
        <div className="activity-list">
          {visitantes && visitantes.length > 0 ? (
            visitantes.slice(0, 5).map(visitante => (
              <div key={visitante.id} className="activity-item">
                <div className="activity-icon">
                  {visitante.atencion_completada ? 
                    <CheckCircle size={16} color="#10b981" /> : 
                    <AlertCircle size={16} color="#f59e0b" />
                  }
                </div>
                <div className="activity-info">
                  <h4>{visitante.nombre || 'Visitante'}</h4>
                  <p>
                    Cédula: {visitante.cedula || 'N/A'} • 
                    {visitante.tipo_visita ? ` ${visitante.tipo_visita}` : ' Sin trámite'}
                  </p>
                </div>
                <div className="activity-time">
                  {visitante.fecha_hora_ingreso ? 
                    new Date(visitante.fecha_hora_ingreso).toLocaleTimeString('es-VE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '--:--'
                  }
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <p>No hay visitantes recientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;