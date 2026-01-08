import React, { useState } from 'react';
import VisitanteForm from '../VisitanteForm';
import { tsjService } from '../../services/api';
import { showToast } from '../Toast';

const ModalNuevoVisitante = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.debug('[ModalNuevoVisitante] render', { isOpen, isSubmitting });

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const resp = await tsjService.createVisitante(formData);
      const created = resp.data;
      let message = 'Visitante creado exitosamente';
      if (created?.historial) {
        message += `\n\nHistorial:\n${created.historial}`;
      }
      showToast(message, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error creando visitante:', err);
      const errorMessage = err.response?.data;
      
      if (typeof errorMessage === 'object') {
        const errores = Object.entries(errorMessage)
          .map(([campo, mensajes]) => `${campo}: ${Array.isArray(mensajes) ? mensajes.join(', ') : mensajes}`)
          .join('\n');
        showToast(`Errores en el formulario:\n${errores}`, 'warning');
      } else {
        showToast(`Error al crear visitante: ${err.response?.data?.detail || err.message || 'Error desconocido'}`, 'danger');
      }
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VisitanteForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      initialData={null}
      isEdit={false}
      isSubmitting={isSubmitting}
    />
  );
};

export default ModalNuevoVisitante;