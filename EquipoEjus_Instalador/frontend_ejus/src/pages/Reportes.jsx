import React, { useEffect, useReducer, useCallback } from 'react';
import { tsjService, descargarArchivo } from '../services/api';

// Sub-componentes
import ReportHeader from '../components/Reportes/ReportHeader';
import ReportFilters from '../components/Reportes/ReportFilters';
import ReportStats from '../components/Reportes/ReportStats';
const ReportCharts = React.lazy(() => import('../components/Reportes/ReportCharts'));
import ReportTable from '../components/Reportes/ReportTable';
import ReportNotes from '../components/Reportes/ReportNotes';
import PdfPreviewModal from '../components/Reportes/PdfPreviewModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const initialState = {
  loading: true,
  error: null,
  reportData: {
    tiposTramites: [],
    visitasMensuales: [],
    tendenciaSemanal: [],
    tendenciaDiaria: [],
    estadisticas: {
      totalVisitas: 0,
      promedioDiario: 0,
      tramiteMasComun: '',
      porcentajeCompletados: 0,
      municipioMasVisitado: ''
    }
  },
  filters: {
    filtroFecha: 'mes',
    municipioFiltro: '',
    tipoFiltro: '',
    referidoFiltro: '',
    fechaDesde: '',
    fechaHasta: ''
  },
  options: {
    municipios: [],
    tipos: [],
    instituciones: []
  },
  pdfModal: {
    isOpen: false,
    url: null
  }
};

function reportReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, reportData: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_OPTIONS':
      return { ...state, options: action.payload };
    case 'OPEN_PDF':
      return { ...state, pdfModal: { isOpen: true, url: action.payload } };
    case 'CLOSE_PDF':
      if (state.pdfModal.url) URL.revokeObjectURL(state.pdfModal.url);
      return { ...state, pdfModal: { isOpen: false, url: null } };
    default:
      return state;
  }
}

const Reportes = () => {
  const [state, dispatch] = useReducer(reportReducer, initialState);
  const { loading, error, reportData, filters, options, pdfModal } = state;

  const cargarDatosReportes = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const apiFilters = {
        municipio: filters.municipioFiltro,
        tipo_visita: filters.tipoFiltro,
        referir_a: filters.referidoFiltro
      };

      if (filters.filtroFecha === 'personalizado') {
        if (filters.fechaDesde) apiFilters.fecha_desde = filters.fechaDesde;
        if (filters.fechaHasta) apiFilters.fecha_hasta = filters.fechaHasta;
      }

      // Paralelizar todas las llamadas API para mejor rendimiento
      const [
        tramitesResp,
        mensualResp,
        semanalResp,
        diarioResp,
        statsResp
      ] = await Promise.all([
        tsjService.getTramitesReporte(filters.filtroFecha, apiFilters),
        tsjService.getVisitasMensuales(apiFilters),
        tsjService.getTendenciaSemanal(apiFilters),
        tsjService.getTendenciaDiaria(14, apiFilters),
        tsjService.getEstadisticasReporte(apiFilters)
      ]);

      const transformedData = {
        tiposTramites: transformTramites(tramitesResp.data?.datos || []),
        visitasMensuales: mensualResp.data?.datos?.map(i => ({
          mes: i.mes || `Mes ${i.mes_numero || 0}`,
          visitas: i.total_visitas || i.cantidad || 0,
          completados: i.completados || 0
        })) || [],
        tendenciaSemanal: semanalResp.data?.datos?.map(i => ({
          semana: i.semana || `Sem ${i.semana_numero || 0}`,
          visitas: i.total_visitas || i.cantidad || 0,
          promedio: i.promedio_diario || 0,
          fecha_inicio: i.fecha_inicio || '',
          fecha_fin: i.fecha_fin || ''
        })) || [],
        tendenciaDiaria: diarioResp.data?.datos?.map(d => ({
          fecha: d.fecha,
          label: d.label,
          visitas: d.visitas
        })) || [],
        estadisticas: {
          totalVisitas: statsResp.data?.total_visitas || 0,
          promedioDiario: statsResp.data?.promedio_diario || 0,
          tramiteMasComun: statsResp.data?.tramite_mas_comun || 'N/A',
          porcentajeCompletados: statsResp.data?.porcentaje_completados || 0,
          municipioMasVisitado: statsResp.data?.municipio_mas_visitado || 'N/A'
        }
      };

      dispatch({ type: 'FETCH_SUCCESS', payload: transformedData });
    } catch (err) {
      console.error('Error cargando reportes:', err);
      dispatch({ type: 'FETCH_ERROR', payload: 'Error al cargar los datos del reporte.' });
    }
  }, [filters]);

  const transformTramites = (raw) => {
    const map = new Map();
    raw.forEach(t => {
      const name = t.nombre || t.tipo_visita || 'Sin nombre';
      const value = t.cantidad || 0;
      const completados = t.completados || 0;
      if (!map.has(name)) {
        map.set(name, { name, value, completados, color: COLORS[map.size % COLORS.length] });
      } else {
        const cur = map.get(name);
        cur.value += value;
        cur.completados += completados;
      }
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    cargarDatosReportes();
  }, [cargarDatosReportes]);

  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        const [tipos, insts, mun] = await Promise.all([
          tsjService.getOpcionesTipoVisita(),
          tsjService.getOpcionesInstituciones(),
          tsjService.getOpcionesMunicipios()
        ]);
        dispatch({
          type: 'SET_OPTIONS',
          payload: {
            tipos: tipos.data || tipos,
            instituciones: insts.data || insts,
            municipios: mun.data || mun
          }
        });
      } catch (e) { console.warn('Error cargando opciones:', e); }
    };
    cargarOpciones();
  }, []);

  const handleVisualizarReporte = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const apiFilters = {
        municipio: filters.municipioFiltro,
        tipo_visita: filters.tipoFiltro,
        referir_a: filters.referidoFiltro
      };
      if (filters.filtroFecha === 'personalizado') {
        if (filters.fechaDesde) apiFilters.fecha_desde = filters.fechaDesde;
        if (filters.fechaHasta) apiFilters.fecha_hasta = filters.fechaHasta;
      }
      const resp = await tsjService.exportarReportePDF(filters.filtroFecha, apiFilters);
      const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }));
      dispatch({ type: 'OPEN_PDF', payload: url });
    } catch (err) {
      console.error('Error PDF:', err);
      dispatch({ type: 'FETCH_ERROR', payload: 'No se pudo generar la vista previa.' });
    } finally {
      dispatch({ type: 'UPDATE_FILTERS', payload: {} }); // Trigger re-render to clear loading if needed
    }
  };

  const handleExportarPDF = async () => {
    try {
      const apiFilters = {
        municipio: filters.municipioFiltro,
        tipo_visita: filters.tipoFiltro,
        referir_a: filters.referidoFiltro
      };
      if (filters.filtroFecha === 'personalizado') {
        if (filters.fechaDesde) apiFilters.fecha_desde = filters.fechaDesde;
        if (filters.fechaHasta) apiFilters.fecha_hasta = filters.fechaHasta;
      }
      const resp = await tsjService.exportarReportePDF(filters.filtroFecha, apiFilters);
      descargarArchivo(resp.data, `reporte_justicia_social_${Date.now()}.pdf`);
    } catch (err) { console.error('Error export:', err); }
  };

  const totalVisitas = reportData.tiposTramites.reduce((s, i) => s + i.value, 0) || reportData.estadisticas.totalVisitas;
  const promedioMensual = reportData.visitasMensuales.length > 0
    ? Math.round(reportData.visitasMensuales.reduce((s, i) => s + i.visitas, 0) / reportData.visitasMensuales.length)
    : 0;

  return (
    <>
      <ReportHeader
        loading={loading}
        handleVisualizarReporte={handleVisualizarReporte}
        handleExportarPDF={handleExportarPDF}
        handleRefresh={cargarDatosReportes}
      />

      <ReportFilters
        loading={loading}
        filtroFecha={filters.filtroFecha}
        setFiltroFecha={(f) => dispatch({ type: 'UPDATE_FILTERS', payload: { filtroFecha: f } })}
        fechaDesde={filters.fechaDesde}
        setFechaDesde={(f) => dispatch({ type: 'UPDATE_FILTERS', payload: { fechaDesde: f } })}
        fechaHasta={filters.fechaHasta}
        setFechaHasta={(f) => dispatch({ type: 'UPDATE_FILTERS', payload: { fechaHasta: f } })}
        municipioFiltro={filters.municipioFiltro}
        setMunicipioFiltro={(m) => dispatch({ type: 'UPDATE_FILTERS', payload: { municipioFiltro: m } })}
        tipoFiltro={filters.tipoFiltro}
        setTipoFiltro={(t) => dispatch({ type: 'UPDATE_FILTERS', payload: { tipoFiltro: t } })}
        referidoFiltro={filters.referidoFiltro}
        setReferidoFiltro={(r) => dispatch({ type: 'UPDATE_FILTERS', payload: { referidoFiltro: r } })}
        municipiosOptions={options.municipios}
        tipoOptions={options.tipos}
        institucionesOptions={options.instituciones}
      />

      {error && <div className="alert alert-warning"><span>{error}</span></div>}

      <ReportStats estadisticas={reportData.estadisticas} />

      <React.Suspense fallback={<div className="loading-container">Cargando visualizaciones...</div>}>
        <ReportCharts
          tiposTramites={reportData.tiposTramites}
          visitasMensuales={reportData.visitasMensuales}
          tendenciaSemanal={reportData.tendenciaSemanal}
          tendenciaDiaria={reportData.tendenciaDiaria}
          totalVisitas={totalVisitas}
          filtroFecha={filters.filtroFecha}
          promedioMensual={promedioMensual}
          COLORS={COLORS}
        />
      </React.Suspense>

      <ReportTable
        tiposTramites={reportData.tiposTramites}
        totalVisitas={totalVisitas}
        filtroFecha={filters.filtroFecha}
        porcentajeCompletados={reportData.estadisticas.porcentajeCompletados}
        COLORS={COLORS}
      />

      <ReportNotes />

      <PdfPreviewModal
        isOpen={pdfModal.isOpen}
        pdfUrl={pdfModal.url}
        onClose={() => dispatch({ type: 'CLOSE_PDF' })}
        onDownload={handleExportarPDF}
      />
    </>
  );
};

export default Reportes;