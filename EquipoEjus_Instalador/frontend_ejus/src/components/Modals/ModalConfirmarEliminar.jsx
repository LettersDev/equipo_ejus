import React, { useEffect } from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';

const ModalConfirmarEliminar = ({ isOpen, onClose, visitante, onConfirm }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !visitante) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-delete-title">
        <div className="modal-header">
          <h3 id="confirm-delete-title">Confirmar Eliminación</h3>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="confirmacion-container">
            <div className="confirmacion-icon">
              <AlertCircle size={48} color="#e53e3e" />
            </div>
            <h4>¿Está seguro de eliminar este visitante?</h4>
            <div className="confirmacion-datos">
              <p><strong>Nombre:</strong> {visitante.nombre}</p>
              <p><strong>Cédula:</strong> {visitante.cedula}</p>
              <p><strong>Fecha de registro:</strong> {visitante.fecha_hora_ingreso ? 
                new Date(visitante.fecha_hora_ingreso).toLocaleDateString('es-VE') : 'No disponible'}</p>
            </div>
            <p className="advertencia">
              ⚠️ Esta acción no se puede deshacer. Se eliminarán todos los datos del visitante.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button 
            type="button"
            className="btn-secondary" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            type="button"
            className="btn-danger" 
            onClick={onConfirm}
          >
            <Trash2 size={16} />
            Eliminar Definitivamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarEliminar;