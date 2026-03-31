import React, { useEffect, useReducer, useCallback } from 'react';
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

const initialState = {
  visitantes: [],
  searchTerm: '',
  loading: true,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
    totalItems: 0
  },
  filters: {},
  modals: {
    ver: false,
    editar: false,
    eliminar: false,
    historial: false,
    confirmSalida: false
  },
  selectedVisitante: null,
  isSubmitting: false,
  confirmSalidaId: null
};

function registrarReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        visitantes: action.payload.visitantes,
        pagination: { ...state.pagination, ...action.payload.pagination }
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload, pagination: { ...state.pagination, currentPage: 1 } };
    case 'SET_PAGE':
      return { ...state, pagination: { ...state.pagination, currentPage: action.payload } };
    case 'SET_ITEMS_PER_PAGE':
      return { ...state, pagination: { ...state.pagination, itemsPerPage: action.payload, currentPage: 1 } };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload, pagination: { ...state.pagination, currentPage: 1 } };
    case 'OPEN_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.modal]: true },
        selectedVisitante: action.visitante || state.selectedVisitante,
        confirmSalidaId: action.confirmSalidaId || state.confirmSalidaId
      };
    case 'CLOSE_MODALS':
      return {
        ...state,
        modals: initialState.modals,
        selectedVisitante: null,
        confirmSalidaId: null
      };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    default:
      return state;
  }
}

const Registrar = () => {
  const [state, dispatch] = useReducer(registrarReducer, initialState);
  const {
    visitantes, searchTerm, loading, error,
    pagination, filters, modals, selectedVisitante,
    isSubmitting, confirmSalidaId
  } = state;

  const cargarVisitantes = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_START' });

      const params = {
        page: pagination.currentPage,
        page_size: pagination.itemsPerPage,
        ordering: '-fecha_hora_ingreso'
      };

      if (searchTerm) params.search = searchTerm;

      if (filters) {
        if (filters.tipo_visita) params.tipo_visita = filters.tipo_visita;
        if (filters.municipio) params.municipio = filters.municipio;
        if (filters.referir_a) {
          if (filters.referir_a === 'REFERIDO') params.referido = '1';
          else params.referir_a = filters.referir_a;
        }
      }

      const response = await tsjService.getVisitantes(params);

      const payload = response.data.results ? {
        visitantes: response.data.results,
        pagination: {
          totalItems: response.data.count,
          totalPages: Math.ceil(response.data.count / pagination.itemsPerPage)
        }
      } : {
        visitantes: response.data,
        pagination: {
          totalItems: response.data.length,
          totalPages: Math.ceil(response.data.length / pagination.itemsPerPage)
        }
      };

      dispatch({ type: 'FETCH_SUCCESS', payload });

    } catch (err) {
      console.error('Error cargando:', err);
      dispatch({ type: 'FETCH_ERROR', payload: `Error: ${err.message}` });
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm, filters]);

  useEffect(() => {
    cargarVisitantes();
  }, [cargarVisitantes]);

  const handlePageChange = (page) => dispatch({ type: 'SET_PAGE', payload: page });

  const handleItemsPerPageChange = (val) => dispatch({ type: 'SET_ITEMS_PER_PAGE', payload: val });

  const handleFilterChange = useCallback((f) => dispatch({ type: 'SET_FILTERS', payload: f || {} }), []);

  const handleSearch = (term) => dispatch({ type: 'SET_SEARCH', payload: term });

  const handleAbrirVer = (v) => dispatch({ type: 'OPEN_MODAL', modal: 'ver', visitante: v });
  const handleAbrirHistorial = (v) => dispatch({ type: 'OPEN_MODAL', modal: 'historial', visitante: v });
  const handleAbrirEditar = (v) => dispatch({ type: 'OPEN_MODAL', modal: 'editar', visitante: v });
  const handleAbrirEliminar = (v) => dispatch({ type: 'OPEN_MODAL', modal: 'eliminar', visitante: v });

  const handleRegistrarSalida = (id) => dispatch({ type: 'OPEN_MODAL', modal: 'confirmSalida', confirmSalidaId: id });

  const handleCerrarModals = () => dispatch({ type: 'CLOSE_MODALS' });

  const handleGuardarVisitante = async (formData) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      if (formData.id) {
        await tsjService.updateVisitante(formData.id, formData);
        showToast('Visitante actualizado exitosamente', 'success');
      } else {
        await tsjService.createVisitante(formData);
        showToast('Visitante creado exitosamente', 'success');
      }
      cargarVisitantes();
      handleCerrarModals();
    } catch (err) {
      console.error('Error guardando:', err);
      const msg = err.response?.data;
      if (typeof msg === 'object') {
        const errors = Object.entries(msg).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
        showToast(`Errores: ${errors}`, 'warning');
      } else {
        showToast(`Error: ${err.message}`, 'danger');
      }
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  const handleConfirmSalida = async () => {
    try {
      await tsjService.registrarSalida(confirmSalidaId);
      showToast('Salida registrada exitosamente', 'success');
      cargarVisitantes();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'danger');
    } finally {
      handleCerrarModals();
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!selectedVisitante) return;
    try {
      await tsjService.deleteVisitante(selectedVisitante.id);
      showToast('Eliminado exitosamente', 'success');
      cargarVisitantes();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'danger');
    } finally {
      handleCerrarModals();
    }
  };

  return (
    <div className="registros-container">
      <Toast />
      <Filtros
        searchTerm={searchTerm}
        setSearchTerm={handleSearch}
        onRefresh={cargarVisitantes}
        itemsPerPage={pagination.itemsPerPage}
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
          <button onClick={cargarVisitantes} className="btn-outline" style={{ marginLeft: '1rem' }}>Reintentar</button>
        </div>
      )}

      <div className="results-info">
        <p>
          Mostrando <strong>{visitantes.length}</strong> de <strong>{pagination.totalItems}</strong> registros
          {searchTerm && <span className="search-info"> para "<em>{searchTerm}</em>"</span>}
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

      {pagination.totalPages > 1 && (
        <Paginacion
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          itemsPerPage={pagination.itemsPerPage}
          totalItems={pagination.totalItems}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          loading={loading}
        />
      )}

      <ModalVerDetalles isOpen={modals.ver} onClose={handleCerrarModals} visitante={selectedVisitante} />
      <ModalHistorial isOpen={modals.historial} onClose={handleCerrarModals} cedula={selectedVisitante?.cedula} />
      <VisitanteForm isOpen={modals.editar} onClose={handleCerrarModals} onSubmit={handleGuardarVisitante} initialData={selectedVisitante} isEdit={true} isSubmitting={isSubmitting} />
      <ModalConfirmarEliminar isOpen={modals.eliminar} onClose={handleCerrarModals} visitante={selectedVisitante} onConfirm={handleConfirmarEliminar} />

      <ConfirmModal
        isOpen={modals.confirmSalida}
        title="Registrar salida"
        message="¿Está seguro de registrar la salida de este visitante?"
        onConfirm={handleConfirmSalida}
        onCancel={handleCerrarModals}
        confirmLabel="Registrar salida"
      />
    </div>
  );
};

export default Registrar;