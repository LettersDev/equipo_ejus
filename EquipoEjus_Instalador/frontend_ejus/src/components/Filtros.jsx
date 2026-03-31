import React, { useEffect } from 'react';
import { Search, Filter, Download, Printer, List, RefreshCw } from 'lucide-react';
import { tsjService } from '../services/api';
import { municipiosLara } from './venezuelaData';

const filterInitialState = {
  showAdvanced: false,
  tipoOpciones: [],
  tipoSeleccionado: '',
  municipioSeleccionado: '',
  referidoSeleccionado: ''
};

function filterReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_ADVANCED':
      return { ...state, showAdvanced: !state.showAdvanced };
    case 'SET_OPCIONES':
      return { ...state, tipoOpciones: action.payload };
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        tipoSeleccionado: '',
        municipioSeleccionado: '',
        referidoSeleccionado: '',
        showAdvanced: false
      };
    case 'CLOSE_ADVANCED':
      return { ...state, showAdvanced: false };
    default:
      return state;
  }
}

const Filtros = ({
  searchTerm,
  setSearchTerm,
  itemsPerPage = 10,
  onItemsPerPageChange,
  onRefresh,
  onExport,
  onPrint,
  onFilterChange
}) => {
  const [state, dispatch] = React.useReducer(filterReducer, filterInitialState);
  const {
    showAdvanced,
    tipoOpciones,
    tipoSeleccionado,
    municipioSeleccionado,
    referidoSeleccionado
  } = state;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (setSearchTerm) setSearchTerm(e.target.value);
    }
  };

  useEffect(() => {
    let mounted = true;
    const cargarTipos = async () => {
      try {
        const resp = await tsjService.getOpcionesTipoVisita();
        if (mounted) dispatch({ type: 'SET_OPCIONES', payload: resp.data || [] });
      } catch (err) {
        if (mounted) {
          dispatch({
            type: 'SET_OPCIONES', payload: [
              ['', 'Todos'],
              ['ASESORIA', 'Asesoría'],
              ['DIVORCIO_MUTUO_ACUERDO', 'Divorcio Mutuo Acuerdo']
            ]
          });
        }
      }
    };
    cargarTipos();
    return () => { mounted = false; };
  }, []);

  const handleLimpiar = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
    if (onFilterChange) onFilterChange({});
  };

  const handleAplicar = () => {
    if (onFilterChange) {
      onFilterChange({
        tipo_visita: tipoSeleccionado || undefined,
        municipio: municipioSeleccionado || undefined,
        referir_a: referidoSeleccionado || undefined
      });
    }
    dispatch({ type: 'CLOSE_ADVANCED' });
  };

  return (
    <div className="table-header">
      <div className="search-box">
        <Search size={18} />
        <label htmlFor="main-search" className="sr-only">Buscar visitantes</label>
        <input
          id="main-search"
          type="text"
          placeholder="Buscar por nombre, cédula, teléfono, municipio..."
          value={searchTerm || ''}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
        />
        <button
          className="btn-clear-search"
          onClick={() => setSearchTerm('')}
          title="Limpiar búsqueda"
        >
          ✕
        </button>
      </div>

      <div className="table-actions">
        <button
          className="btn-icon"
          onClick={() => dispatch({ type: 'TOGGLE_ADVANCED' })}
          title="Mostrar filtros avanzados"
        >
          <Filter size={18} />
          Filtros
        </button>

        {showAdvanced && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label htmlFor="filtro-tipo">Trámite:</label>
              <select
                id="filtro-tipo"
                value={tipoSeleccionado}
                onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'tipoSeleccionado', value: e.target.value })}
              >
                <option value="">Todos</option>
                {tipoOpciones.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filtro-municipio">Ubicación (Municipio):</label>
              <select
                id="filtro-municipio"
                value={municipioSeleccionado}
                onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'municipioSeleccionado', value: e.target.value })}
              >
                <option value="">Todos</option>
                {municipiosLara.map(m => (
                  <option key={m.id} value={m.nombre}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filtro-referido">Referido:</label>
              <select
                id="filtro-referido"
                value={referidoSeleccionado}
                onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'referidoSeleccionado', value: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="NO_REFERIDO">No referido</option>
                <option value="REFERIDO">Referido (cualquiera)</option>
              </select>
            </div>
            <div className="filter-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleLimpiar}
              >Limpiar</button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleAplicar}
              >Aplicar</button>
            </div>
          </div>
        )}

        {onItemsPerPageChange && (
          <div className="items-per-page-container">
            <List size={16} />
            <select
              title="Registros por página"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="items-per-page-select"
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>
        )}

        {onRefresh && (
          <button className="btn-icon" onClick={onRefresh} title="Actualizar datos">
            <RefreshCw size={18} />
            Actualizar
          </button>
        )}

        {onExport && (
          <button className="btn-icon" onClick={onExport} title="Exportar datos">
            <Download size={18} />
            Exportar
          </button>
        )}

        {onPrint && (
          <button className="btn-icon" onClick={onPrint} title="Imprimir lista">
            <Printer size={18} />
            Imprimir
          </button>
        )}
      </div>
    </div>
  );
};

export default Filtros;