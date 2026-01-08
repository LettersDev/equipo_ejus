import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Printer, List, RefreshCw } from 'lucide-react';
import { tsjService } from '../services/api';
import { municipiosLara } from './venezuelaData';

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tipoOpciones, setTipoOpciones] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState('');
  const [referidoSeleccionado, setReferidoSeleccionado] = useState('');
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };
  
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Disparar búsqueda inmediata al presionar Enter
      if (setSearchTerm) setSearchTerm(e.target.value);
    }
  };

  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const resp = await tsjService.getOpcionesTipoVisita();
        setTipoOpciones(resp.data || []);
      } catch (err) {
        // fallback simple
        setTipoOpciones([
          ['','Todos'],
          ['ASESORIA','Asesoría'],
          ['DIVORCIO_MUTUO_ACUERDO','Divorcio Mutuo Acuerdo']
        ]);
      }
    };
    cargarTipos();
  }, []);

  // No propagar automáticamente: usar Aplicar/Limpiar para mayor control y evitar llamadas innecesarias


  return (
    <div className="table-header">
      <div className="search-box">
        <Search size={18} />
        <input
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
          onClick={() => setShowAdvanced(!showAdvanced)}
          title="Mostrar filtros avanzados"
        >
          <Filter size={18} />
          Filtros
        </button>
        
        {/* Filtros avanzados (opcional) */}
        {showAdvanced && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label>Trámite:</label>
              <select
                value={tipoSeleccionado}
                onChange={(e) => setTipoSeleccionado(e.target.value)}
              >
                <option value="">Todos</option>
                {tipoOpciones.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Ubicación (Municipio):</label>
              <select
                value={municipioSeleccionado}
                onChange={(e) => setMunicipioSeleccionado(e.target.value)}
              >
                <option value="">Todos</option>
                {municipiosLara.map(m => (
                  <option key={m.id} value={m.nombre}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Referido:</label>
              <select
                value={referidoSeleccionado}
                onChange={(e) => setReferidoSeleccionado(e.target.value)}
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
                onClick={() => {
                  setTipoSeleccionado('');
                  setMunicipioSeleccionado('');
                  setReferidoSeleccionado('');
                  if (onFilterChange) onFilterChange({});
                  setShowAdvanced(false);
                }}
              >Limpiar</button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (onFilterChange) onFilterChange({
                    tipo_visita: tipoSeleccionado || undefined,
                    municipio: municipioSeleccionado || undefined,
                    referir_a: referidoSeleccionado || undefined
                  });
                  setShowAdvanced(false);
                }}
              >Aplicar</button>
            </div>
          </div>
        )}
        
        {/* Selector de items por página */}
        {onItemsPerPageChange && (
          <div className="items-per-page-container">
            <List size={16} />
            <select
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
        
        {/* Botón de refresh */}
        {onRefresh && (
          <button className="btn-icon" onClick={onRefresh} title="Actualizar datos">
            <RefreshCw size={18} />
            Actualizar
          </button>
        )}
        
        {/* Botón de exportar */}
        {onExport && (
          <button className="btn-icon" onClick={onExport} title="Exportar datos">
            <Download size={18} />
            Exportar
          </button>
        )}
        
        {/* Botón de imprimir */}
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