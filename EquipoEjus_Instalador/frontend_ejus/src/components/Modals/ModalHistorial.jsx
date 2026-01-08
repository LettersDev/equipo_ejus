import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { tsjService } from '../../services/api';

const ModalHistorial = ({ isOpen, onClose, cedula }) => {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !cedula) return;
    let mounted = true;
    const fetchHistorial = async () => {
      setLoading(true);
      setError(null);
      try {
        // use search param with cedula to fetch matching visitas
        const params = { search: String(cedula), ordering: '-fecha_hora_ingreso', page_size: 200 };
        const resp = await tsjService.getVisitantes(params);
        const items = resp.data.results ? resp.data.results : resp.data;
        if (mounted) setVisitas(items.filter(v => String(v.cedula).trim() === String(cedula).trim()));
      } catch (e) {
        if (mounted) setError('Error cargando historial: ' + (e?.message || ''));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchHistorial();
    return () => { mounted = false; };
  }, [isOpen, cedula]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg" role="dialog" aria-modal="true" aria-labelledby="historial-title">
        <div className="modal-header">
          <h3 id="historial-title">Historial de visitas</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="modal-body">
          {loading && <div className="loading-spinner" />}
          {error && <div className="alert alert-warning">{error}</div>}

          {!loading && visitas.length === 0 && (
            <div className="no-data-container">
              <p>No se encontraron visitas para la cédula {cedula}</p>
            </div>
          )}

          {visitas.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Trámite</th>
                  <th>Referido a</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {visitas.map(v => (
                  <tr key={v.id}>
                    <td>{v.fecha_hora_ingreso ? new Date(v.fecha_hora_ingreso).toLocaleDateString('es-VE') : ''}</td>
                    <td>{v.fecha_hora_ingreso ? new Date(v.fecha_hora_ingreso).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                    <td>{v.tipo_visita ? v.tipo_visita.replace(/_/g, ' ') : ''}</td>
                    <td>{v.referir_a === 'OTRA_INSTITUCION' ? v.otra_institucion : (v.referir_a === 'NO_REFERIDO' ? 'No referido' : v.referir_a)}</td>
                    <td>{v.atencion_completada ? 'Completado' : 'En atención'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-outline" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

ModalHistorial.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  cedula: PropTypes.string
};

export default ModalHistorial;
