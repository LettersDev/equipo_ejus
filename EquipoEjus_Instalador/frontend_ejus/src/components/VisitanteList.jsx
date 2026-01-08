import React from 'react';
import { Eye, Edit, LogOut, Trash2, MapPin, Phone, Building, ArrowRightCircle, CheckCircle, Clock, Users } from 'lucide-react';

const VisitanteList = ({ 
  visitantes, 
  handleAbrirVer, 
  handleAbrirEditar, 
  handleRegistrarSalida, 
  handleAbrirEliminar,
  handleAbrirHistorial,
  loading = false
}) => {
  
  // Función para formatear el tipo de visita
  const formatTipoVisita = (tipo) => {
    if (!tipo) return 'Sin especificar';
    
    // Reemplazar guiones bajos y convertir a título
    return tipo
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace('Mutuo Acuerdo', 'Mutuo Acuerdo')
      .replace('Unicos Herederos', 'Únicos Herederos');
  };

  // Función para obtener color del badge según tipo de visita
  const getBadgeColor = (tipo) => {
    if (!tipo) return 'default';
    
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('asesoria')) return 'asesoria';
    if (tipoLower.includes('divorcio')) return 'divorcio';
    if (tipoLower.includes('curatela') || tipoLower.includes('tutela')) return 'tutela';
    if (tipoLower.includes('herencia') || tipoLower.includes('hered')) return 'herencia';
    if (tipoLower.includes('paternidad') || tipoLower.includes('impugnacion')) return 'paternidad';
    if (tipoLower.includes('viaje') || tipoLower.includes('permiso')) return 'viaje';
    return 'default';
  };

  // Función para mostrar información de referido
  const getReferidoInfo = (visitante) => {
    if (!visitante.referir_a || visitante.referir_a === 'NO_REFERIDO') {
      return {
        fueReferido: false,
        texto: 'No referido',
        icono: <CheckCircle size={12} />,
        clase: 'no-referido'
      };
    }
    
    let institucion = '';
    if (visitante.referir_a === 'OTRA_INSTITUCION' && visitante.otra_institucion) {
      institucion = visitante.otra_institucion;
    } else {
      // Convertir código a texto legible
      const instituciones = {
        'MINISTERIO_PUBLICO': 'Ministerio Público',
        'DEFENSORIA_DEL_PUEBLO': 'Defensoría del Pueblo',
        'PREFECTURA': 'Prefectura',
        'JUECES_DE_PAZ': 'Jueces de Paz',
        'REGISTRO_INMOBILIARIO': 'Registro Inmobiliario',
        'REGISTRO_MERCANTIL': 'Registro Mercantil',
        'REGISTRO_PRINCIPAL': 'Registro Principal',
        'REGISTRO_CIVIL': 'Registro Civil',
        'NOTARIA_PUBLICA': 'Notaría Pública',
        'COMANDANCIA_POLICIA': 'Comandancia de la Policía',
        'CICPC': 'CICPC',
        'POLICIA_NACIONAL_BOLIVARIANA': 'Policía Nacional Bolivariana',
        'GOBERNACION': 'Gobernación',
        'ALCALDIA': 'Alcaldía',
        'DEFENSA_PUBLICA': 'Defensa Pública',
        'SENIAT': 'SENIAT',
        'SEMAT': 'SEMAT',
        'SUNDEE': 'SUNDEE',
        'SEMAMECF': 'SEMAMECF',
        'INAMUJER': 'INAMUJER',
        'URDD': 'URDD',
        'OAP': 'OAP',
        'TRIBUNAL_SUPREMO_JUSTICIA': 'TSJ (esta misma)'
      };
      institucion = instituciones[visitante.referir_a] || visitante.referir_a;
    }
    
    return {
      fueReferido: true,
      texto: institucion,
      icono: <ArrowRightCircle size={12} />,
      clase: 'referido'
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando visitantes...</p>
      </div>
    );
  }

  if (!visitantes || visitantes.length === 0) {
    return (
      <div className="no-data-container">
        <div className="no-data-icon">
          <Users size={48} color="#9ca3af" />
        </div>
        <h3>No hay visitantes registrados</h3>
        <p>No se encontraron visitantes con los criterios actuales.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cédula</th>
            <th>Contacto</th>
            <th>Ubicación</th>
            <th>Trámite</th>
            <th>Referido a</th>
            <th>Ingreso</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visitantes.map(visitante => {
            const referidoInfo = getReferidoInfo(visitante);
            
            return (
              <tr key={visitante.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {visitante.nombre ? visitante.nombre.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <strong>{visitante.nombre || 'Sin nombre'}</strong>
                        {visitante.visit_count != null && (
                          <span className="badge visit-count-badge">{visitante.visit_count}</span>
                        )}
                      </div>
                      
                    </div>
                  </div>
                </td>
                <td>
                  <div className="cedula-info">
                    <span className="cedula-number">{visitante.cedula || 'N/A'}</span>
                  </div>
                </td>
                <td>
                  {visitante.telefono ? (
                    <div className="contact-info">
                      <Phone size={12} />
                      <span>{visitante.telefono}</span>
                    </div>
                  ) : (
                    <span className="text-muted">Sin teléfono</span>
                  )}
                </td>
                <td>
                  <div className="location-info">
                    <MapPin size={12} />
                    <span>
                      {visitante.municipio || 'Sin municipio'}
                      {visitante.parroquia && `, ${visitante.parroquia}`}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getBadgeColor(visitante.tipo_visita)}`}>
                    {formatTipoVisita(visitante.tipo_visita)}
                  </span>
                </td>
                <td>
                  <div className={`referido-info ${referidoInfo.clase}`}>
                    {referidoInfo.icono}
                    <span>{referidoInfo.texto}</span>
                    {referidoInfo.fueReferido && visitante.otra_institucion && (
                      <div className="referido-detalle">
                        <small>{visitante.otra_institucion}</small>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="time-info">
                    {visitante.fecha_hora_ingreso ? 
                      new Date(visitante.fecha_hora_ingreso).toLocaleTimeString('es-VE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '--:--'
                    }
                    <div className="date-sub">
                      {visitante.fecha_hora_ingreso ? 
                        new Date(visitante.fecha_hora_ingreso).toLocaleDateString('es-VE', {
                          day: '2-digit',
                          month: 'short'
                        }) : ''
                      }
                    </div>
                  </div>
                </td>
                <td>
              <div className="status-with-time">
              <span className={`status ${visitante.atencion_completada ? 'completed' : 'active'}`}>
              {visitante.atencion_completada ? 'Completado' : 'En atención'}
             </span>
    
            {visitante.duracion_atencion && !visitante.atencion_completada && (
          <span className="time-badge">
          {visitante.duracion_atencion.replace(/EN ATENCI[ÓO]N/gi, '').trim()}
         </span>
     )}
  </div>
</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action info"
                      onClick={() => handleAbrirVer(visitante)}
                      title="Ver detalles completos"
                    >
                      <Eye size={14} />
                      <span className="tooltip">Ver</span>
                    </button>
                      <button
                        className="btn-action info"
                        onClick={() => handleAbrirHistorial ? handleAbrirHistorial(visitante) : handleAbrirVer(visitante)}
                        title="Historial"
                      >
                        <Clock size={14} />
                        <span className="tooltip">Historial</span>
                      </button>
                    
                    <button
                      className="btn-action warning"
                      onClick={() => handleAbrirEditar(visitante)}
                      title="Editar información"
                    >
                      <Edit size={14} />
                      <span className="tooltip">Editar</span>
                    </button>
                    
                    {!visitante.atencion_completada && (
                      <button
                        className="btn-action success"
                        onClick={() => handleRegistrarSalida(visitante.id)}
                        title="Registrar salida del visitante"
                      >
                        <LogOut size={14} />
                        <span className="tooltip">Salida</span>
                      </button>
                    )}
                    
                    <button
                      className="btn-action danger"
                      onClick={() => handleAbrirEliminar(visitante)}
                      title="Eliminar registro"
                    >
                      <Trash2 size={14} />
                      <span className="tooltip">Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VisitanteList;
