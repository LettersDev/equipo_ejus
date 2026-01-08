import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Paginacion = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  filteredItems = 0,
  onPageChange,
  onItemsPerPageChange,
  loading = false,
  hasSearch = false
}) => {
  // Calcular páginas y items mostrados; usar totalPages si está disponible
  const computedTotalPages = totalPages || Math.ceil((totalItems || 0) / (itemsPerPage || 1));
  const displayTotalPages = Math.max(0, computedTotalPages);
  const displayTotalItems = totalItems || 0;

  if (displayTotalPages <= 1 && displayTotalItems <= itemsPerPage) {
    return null;
  }

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (displayTotalPages <= maxVisiblePages) {
      // Mostrar todas las páginas
      for (let i = 1; i <= displayTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      const half = Math.floor(maxVisiblePages / 2);
      let start = currentPage - half;
      let end = currentPage + half;
      
      if (start < 1) {
        start = 1;
        end = maxVisiblePages;
      }
      
      if (end > displayTotalPages) {
        end = displayTotalPages;
        start = displayTotalPages - maxVisiblePages + 1;
      }
      
      // Agregar primera página y elipsis si es necesario
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      // Agregar páginas del rango
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Agregar última página y elipsis si es necesario
      if (end < displayTotalPages) {
        if (end < displayTotalPages - 1) pages.push('...');
        pages.push(displayTotalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (!loading && onPageChange && page >= 1 && page <= displayTotalPages) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    if (!loading && onItemsPerPageChange) {
      const newItemsPerPage = Number(e.target.value);
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  return (
    <div className="paginacion-container">
      <div className="paginacion-info">
        <div className="items-per-page-container">
          <span>Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="items-per-page-select"
            disabled={loading}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        <div className="items-info">
          <span>
            Página {currentPage} de {displayTotalPages} • 
            {hasSearch ? (
              <span className="filtered-info">
                {' '}{filteredItems.toLocaleString()} de {totalItems.toLocaleString()} registros
              </span>
            ) : (
              <span>{' '}{displayTotalItems.toLocaleString()} registros</span>
            )}
          </span>
          {loading && <span className="loading-indicator"> (cargando...)</span>}
        </div>
      </div>
      
      <div className="paginacion-buttons">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || loading || displayTotalPages === 0}
          className="paginacion-btn first"
          title="Primera página"
        >
          <ChevronsLeft size={16} />
        </button>
        
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading || displayTotalPages === 0}
          className="paginacion-btn prev"
          title="Página anterior"
        >
          <ChevronLeft size={16} />
          <span className="btn-text">Anterior</span>
        </button>
        
        <div className="page-numbers">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => handlePageChange(page)}
                className={`page-number ${currentPage === page ? 'active' : ''}`}
                disabled={loading || displayTotalPages === 0}
                title={`Ir a página ${page}`}
              >
                {page}
              </button>
            )
          ))}
        </div>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === displayTotalPages || loading || displayTotalPages === 0}
          className="paginacion-btn next"
          title="Página siguiente"
        >
          <span className="btn-text">Siguiente</span>
          <ChevronRight size={16} />
        </button>
        
        <button
          onClick={() => handlePageChange(displayTotalPages)}
          disabled={currentPage === displayTotalPages || loading || displayTotalPages === 0}
          className="paginacion-btn last"
          title="Última página"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Paginacion;