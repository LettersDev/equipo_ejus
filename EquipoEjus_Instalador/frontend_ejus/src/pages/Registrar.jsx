import React, { useState, useEffect, useCallback } from 'react';
import Filtros from '../components/Filtros';
import VisitanteList from '../components/VisitanteList';
import Paginacion from '../components/Paginacion';
import ModalVerDetalles from '../components/Modals/ModalVerDetalles';
import ModalHistorial from '../components/Modals/ModalHistorial';
import ModalConfirmarEliminar from '../components/Modals/ModalConfirmarEliminar';
import VisitanteForm from '../components/VisitanteForm';
import Toast, { showToast } from '../components/Toast';
import ConfirmModal from '../components/Modals/ConfirmModal';
import { tsjService } from '../services/api';

const Registrar = () => {
  // Estados para datos
  const [visitantes, setVisitantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({});

  // Estados para modales
  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [modalHistorialOpen, setModalHistorialOpen] = useState(false);
  const [selectedVisitante, setSelectedVisitante] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSalidaOpen, setConfirmSalidaOpen] = useState(false);
  const [confirmSalidaId, setConfirmSalidaId] = useState(null);

  // Cargar visitantes desde API - usando useCallback para evitar recreación en cada render
  const cargarVisitantes = useCallback(async (page = 1, search = '', appliedFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page,
        page_size: itemsPerPage,
        ordering: '-fecha_hora_ingreso'
      };

      // Si hay término de búsqueda, agregar parámetros de búsqueda
      if (search) {
        params.search = search;
      }

      // Aplicar filtros adicionales si vienen
      if (appliedFilters) {
        if (appliedFilters.tipo_visita) params.tipo_visita = appliedFilters.tipo_visita;
        if (appliedFilters.municipio) params.municipio = appliedFilters.municipio;
        if (appliedFilters.referir_a) {
          if (appliedFilters.referir_a === 'REFERIDO') {
            // indicar al backend que filtre referidos (no NO_REFERIDO)
            params.referido = '1';
          } else {
            params.referir_a = appliedFilters.referir_a;
          }
        }
      }

      const response = await tsjService.getVisitantes(params);

      // Manejar diferentes estructuras de respuesta (paginada vs lista simple)
      if (response.data.results) {
        // Respuesta paginada (DRF)
        setVisitantes(response.data.results);
        setTotalItems(response.data.count || response.data.results.length);
        setTotalPages(Math.ceil((response.data.count || response.data.results.length) / itemsPerPage));
      } else {
        // Respuesta como lista simple
        setVisitantes(response.data);
        setTotalItems(response.data.length);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      }

    } catch (err) {
      console.error('Error cargando visitantes:', err);
      setError(`Error al cargar visitantes: ${err.message || 'Error desconocido'}. Verifica que el backend esté funcionando.`);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Cargar datos iniciales y cuando cambien las dependencias
  useEffect(() => {
    cargarVisitantes(currentPage, searchTerm, filters);
  }, [cargarVisitantes, currentPage, searchTerm, filters]);

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Manejar cambio de items por página
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Volver a la primera página
  };

  const handleFilterChange = React.useCallback((newFilters) => {
    setFilters(newFilters || {});
    setCurrentPage(1);
  }, []);

  // Manejar búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Volver a la primera página al buscar
  };

  // ========== FUNCIONES PARA MODALES ==========
  
  // Ver detalles
  const handleAbrirVer = (visitante) => {
    setSelectedVisitante(visitante);
    setModalVerOpen(true);
  };

  // Historial por cédula (abre modal específico)
  const handleAbrirHistorial = (visitante) => {
    setSelectedVisitante(visitante);
    setModalHistorialOpen(true);
  };

  const handleCerrarVer = () => {
    setModalVerOpen(false);
    setSelectedVisitante(null);
  };
  const handleCerrarHistorial = () => {
    setModalHistorialOpen(false);
    setSelectedVisitante(null);
  };

  // Editar
  const handleAbrirEditar = (visitante) => {
    setSelectedVisitante(visitante);
    setModalEditarOpen(true);
  };

  const handleCerrarEditar = () => {
    setModalEditarOpen(false);
    setSelectedVisitante(null);
  };

  // Guardar cambios (editar)
  const handleGuardarVisitante = async (formData) => {
    try {
      setIsSubmitting(true);
      
      if (formData.id) {
        // Editar existente
        await tsjService.updateVisitante(formData.id, formData);
        showToast('Visitante actualizado exitosamente', 'success');
      } else {
        // Crear nuevo (por si acaso)
        await tsjService.createVisitante(formData);
        showToast('Visitante creado exitosamente', 'success');
      }
      
      // Recargar datos
      cargarVisitantes(currentPage, searchTerm);
      handleCerrarEditar();
      
    } catch (err) {
      console.error('Error guardando visitante:', err);
      const errorMessage = err.response?.data;
      
        if (typeof errorMessage === 'object') {
        // Mostrar errores específicos del formulario
        const errores = Object.entries(errorMessage)
          .map(([campo, mensajes]) => `${campo}: ${Array.isArray(mensajes) ? mensajes.join(', ') : mensajes}`)
          .join('\n');
        showToast(`Errores en el formulario:\n${errores}`, 'warning');
      } else {
        showToast(`Error al guardar visitante: ${err.response?.data?.detail || err.message || 'Error desconocido'}`, 'danger');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Registrar salida
  const handleRegistrarSalida = async (id) => {
    setConfirmSalidaId(id);
    setConfirmSalidaOpen(true);
  };

  const handleConfirmSalida = async () => {
    const id = confirmSalidaId;
    setConfirmSalidaOpen(false);
    setConfirmSalidaId(null);
    try {
      await tsjService.registrarSalida(id);
      showToast('Salida registrada exitosamente', 'success');
      cargarVisitantes(currentPage, searchTerm);
    } catch (err) {
      console.error('Error registrando salida:', err);
      showToast(`Error al registrar salida: ${err.response?.data?.detail || err.message || 'Error desconocido'}`, 'danger');
    }
  };

  // Eliminar
  const handleAbrirEliminar = (visitante) => {
    setSelectedVisitante(visitante);
    setModalEliminarOpen(true);
  };

  const handleCerrarEliminar = () => {
    setModalEliminarOpen(false);
    setSelectedVisitante(null);
  };

  const handleConfirmarEliminar = async () => {
    if (!selectedVisitante) return;
    
    try {
      await tsjService.deleteVisitante(selectedVisitante.id);
      showToast('Visitante eliminado exitosamente', 'success');
      cargarVisitantes(currentPage, searchTerm);
      handleCerrarEliminar();
    } catch (err) {
      console.error('Error eliminando visitante:', err);
      showToast(`Error al eliminar visitante: ${err.response?.data?.detail || err.message || 'Error desconocido'}`, 'danger');
    }
  };

  // Refresh datos
  const handleRefresh = () => {
    cargarVisitantes(currentPage, searchTerm);
  };

  // Mostrar carga mientras mantenemos los filtros y la interfaz visible
  // Evitar retorno temprano que desmonta el input de búsqueda y provoca pérdida de foco

  return (
    <div className="registros-container">
      <Toast />
      <Filtros 
        searchTerm={searchTerm} 
        setSearchTerm={handleSearch}
        onRefresh={handleRefresh}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        onFilterChange={handleFilterChange}
      />
      {loading && visitantes.length === 0 && (
        <div className="loading-container" style={{ marginTop: '1rem' }}>
          <div className="loading-spinner"></div>
          <p>Cargando registros...</p>
        </div>
      )}
      
      {error && (
        <div className="alert alert-warning">
          <span>{error}</span>
          <button 
            onClick={handleRefresh}
            className="btn-outline"
            style={{ marginLeft: '1rem' }}
          >
            Reintentar
          </button>
        </div>
      )}
      
      {/* Contador de resultados */}
      <div className="results-info">
        <p>
          Mostrando <strong>{visitantes.length}</strong> de <strong>{totalItems}</strong> registros
          {searchTerm && (
            <span className="search-info">
              {' '}para "<em>{searchTerm}</em>"
            </span>
          )}
        </p>
      </div>
      
      <VisitanteList 
        visitantes={visitantes}
        handleAbrirVer={handleAbrirVer}
        handleAbrirHistorial={handleAbrirHistorial}
        handleAbrirEditar={handleAbrirEditar}
        handleRegistrarSalida={handleRegistrarSalida}
        handleAbrirEliminar={handleAbrirEliminar}
        loading={loading}
      />
      
      {/* Componente de Paginación */}
      {totalPages > 1 && (
        <Paginacion
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          loading={loading}
        />
      )}
      
      {/* ========== MODALES ========== */}
      
      {/* Modal Ver Detalles */}
      <ModalVerDetalles
        isOpen={modalVerOpen}
        onClose={handleCerrarVer}
        visitante={selectedVisitante}
      />

      {/* Modal Historial (visitas por cédula) */}
      <ModalHistorial
        isOpen={modalHistorialOpen}
        onClose={handleCerrarHistorial}
        cedula={selectedVisitante?.cedula}
      />
      
      {/* Modal Editar (usando VisitanteForm) */}
      <VisitanteForm
        isOpen={modalEditarOpen}
        onClose={handleCerrarEditar}
        onSubmit={handleGuardarVisitante}
        initialData={selectedVisitante}
        isEdit={true}
        isSubmitting={isSubmitting}
      />
      
      {/* Modal Eliminar */}
      <ModalConfirmarEliminar
        isOpen={modalEliminarOpen}
        onClose={handleCerrarEliminar}
        visitante={selectedVisitante}
        onConfirm={handleConfirmarEliminar}
      />

      <ConfirmModal
        isOpen={confirmSalidaOpen}
        title="Registrar salida"
        message="¿Está seguro de registrar la salida de este visitante?"
        onConfirm={handleConfirmSalida}
        onCancel={() => { setConfirmSalidaOpen(false); setConfirmSalidaId(null); }}
        confirmLabel="Registrar salida"
      />
    </div>
  );
};

export default Registrar;