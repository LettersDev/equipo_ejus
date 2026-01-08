import React, { useEffect } from 'react';

const ModalVerDetalles = ({ isOpen, onClose, visitante }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !visitante) return null;

  // Función para formatear tipo de visita
  const formatTipoVisita = (tipo) => {
    if (!tipo) return 'No especificado';
    return tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Función para formatear institución referida
  const formatInstitucion = (visitante) => {
    if (visitante.referir_a === 'OTRA_INSTITUCION' && visitante.otra_institucion) {
      return visitante.otra_institucion;
    } else if (visitante.referir_a === 'NO_REFERIDO') {
      return 'No requiere referir';
    } else {
      // Convertir el valor del backend a texto legible
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
        'TRIBUNAL_SUPREMO_JUSTICIA': 'Tribunal Supremo de Justicia'
      };
      return instituciones[visitante.referir_a] || visitante.referir_a;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg" role="dialog" aria-modal="true" aria-labelledby="detalles-title">
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="avatar-large">{(visitante.nombre || '?').charAt(0).toUpperCase()}</div>
            <div>
              <h3 id="detalles-title">Detalles del Visitante</h3>
              <p className="subtitle">{visitante.nombre || 'Sin nombre'}</p>
              <p className="subtitle-meta">Cédula: {visitante.cedula || 'No registrada'} • Tel: {visitante.telefono || 'No registrado'}</p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="modal-body">
          <div className="detalles-container">
            <div className="detalle-grid">
              <div className="detalle-item">
                <label>Nombre Completo</label>
                <p className="value">{visitante.nombre || 'No especificado'}</p>
              </div>
              
              <div className="detalle-item">
                <label>Municipio</label>
                <p className="value">{visitante.municipio || 'No especificado'}</p>
              </div>
              
              <div className="detalle-item">
                <label>Parroquia</label>
                <p className="value">{visitante.parroquia || 'No especificado'}</p>
              </div>
              
              <div className="detalle-item">
                <label>Dirección</label>
                <p className="value">{visitante.direccion || 'No especificado'}</p>
              </div>
              
              <div className="detalle-item">
                <label>Tipo de Trámite</label>
                <p className="value">{formatTipoVisita(visitante.tipo_visita)}</p>
              </div>
              
              <div className="detalle-item">
                <label>Referir a</label>
                <p className="value">{formatInstitucion(visitante)}</p>
              </div>
              
              <div className="detalle-item">
                <label>Fecha y Hora de Ingreso:</label>
                <p>{visitante.fecha_hora_ingreso ? 
                  new Date(visitante.fecha_hora_ingreso).toLocaleString('es-VE') : 
                  'No registrada'}</p>
              </div>
              
              <div className="detalle-item">
                <label>Fecha y Hora de Salida:</label>
                <p>{visitante.fecha_hora_salida ? 
                  new Date(visitante.fecha_hora_salida).toLocaleString('es-VE') : 
                  'No registrada'}</p>
              </div>
              
              <div className="detalle-item">
                <label>Estado</label>
                <div>
                  <span className={`status-badge ${visitante.atencion_completada ? 'completed' : 'active'}`}>
                    {visitante.atencion_completada ? 'Completado' : 'En atención'}
                  </span>
                </div>
              </div>
              
              <div className="detalle-item">
                <label>Duración:</label>
                <p>{visitante.duracion_atencion || 'En atención'}</p>
              </div>
              
              {visitante.observaciones && (
                <div className="detalle-item full-width">
                  <label>Observaciones</label>
                  <div className="observaciones-detalle">{visitante.observaciones}</div>
                </div>
              )}

              {visitante.historial && (
                <div className="detalle-item full-width">
                  <label>Historial</label>
                  <div className="historial-content">
                    {visitante.historial.split('\n').map((line, idx) => (
                      <div key={idx} className="historial-line">{line}</div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="detalle-item">
                <label>Registrado el:</label>
                <p>{visitante.creado_en ? 
                  new Date(visitante.creado_en).toLocaleString('es-VE') : 
                  'No disponible'}</p>
                {visitante.creado_por && (
                  <p className="meta-small">Creado por: {visitante.creado_por}</p>
                )}
              </div>
              
              <div className="detalle-item">
                <label>Última actualización:</label>
                <p>{visitante.actualizado_en ? 
                  new Date(visitante.actualizado_en).toLocaleString('es-VE') : 
                  'No disponible'}</p>
                {visitante.actualizado_por && (
                  <p className="meta-small">Actualizado por: {visitante.actualizado_por}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-outline" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalVerDetalles;