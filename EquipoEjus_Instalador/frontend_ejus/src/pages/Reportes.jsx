import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  FileText, PieChart as PieChartIcon, BarChart2, 
  TrendingUp, Download, Calendar, Users, AlertCircle,
  RefreshCw, Filter, X
} from 'lucide-react';
import { tsjService, descargarArchivo } from '../services/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const Reportes = () => {
  // Estados para los datos
  const [reportData, setReportData] = useState({
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
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroFecha, setFiltroFecha] = useState('mes');
  const [municipioFiltro, setMunicipioFiltro] = useState('');
  const [municipiosOptions, setMunicipiosOptions] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [referidoFiltro, setReferidoFiltro] = useState('');
  const [tipoOptions, setTipoOptions] = useState([]);
  const [institucionesOptions, setInstitucionesOptions] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advMunicipio, setAdvMunicipio] = useState('');
  const [advTipo, setAdvTipo] = useState('');
  const [advReferido, setAdvReferido] = useState('');

  // Colores predefinidos para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Cargar datos desde la API
  const cargarDatosReportes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir filtros a enviar al backend
      const filters = {};
      if (municipioFiltro) filters.municipio = municipioFiltro;
      if (tipoFiltro) filters.tipo_visita = tipoFiltro;
      if (referidoFiltro) filters.referir_a = referidoFiltro;

      // 1. Obtener datos de trámites
      const tramitesResponse = await tsjService.getTramitesReporte(filtroFecha, filters);
      
      // 2. Obtener datos mensuales
      const mensualResponse = await tsjService.getVisitasMensuales(filters);
      
      // 3. Obtener tendencia semanal
      const semanalResponse = await tsjService.getTendenciaSemanal(filters);

      // 3b. Obtener tendencia diaria (últimos 14 días)
      const diarioResponse = await tsjService.getTendenciaDiaria(14, filters);

      // 4. Obtener estadísticas generales
      const statsResponse = await tsjService.getEstadisticasReporte(filters);

      // Transformar datos para los gráficos usando la estructura REAL de la API
      const datosTransformados = {
        // Datos de trámites
        // Datos de trámites (agrupar/deduplicar por nombre)
        tiposTramites: (() => {
          const raw = tramitesResponse.data?.datos || [];
          const map = new Map();
          raw.forEach((tramite, index) => {
            const name = tramite.nombre || tramite.tipo_visita || 'Sin nombre';
            const value = tramite.cantidad || 0;
            const completados = tramite.completados || 0;
            if (!map.has(name)) {
              map.set(name, { name, value, completados, color: COLORS[map.size % COLORS.length] });
            } else {
              const cur = map.get(name);
              cur.value += value;
              cur.completados += completados;
            }
          });
          return Array.from(map.values());
        })(),
        
        // Visitas mensuales
        visitasMensuales: mensualResponse.data?.datos?.map(item => ({
          mes: item.mes || `Mes ${item.mes_numero || 0}`,
          visitas: item.total_visitas || item.cantidad || 0,
          completados: item.completados || 0
        })) || [],
        
        // Tendencia semanal
        tendenciaSemanal: semanalResponse.data?.datos?.map(item => ({
          semana: item.semana || `Sem ${item.semana_numero || 0}`,
          visitas: item.total_visitas || item.cantidad || 0,
          promedio: item.promedio_diario || 0,
          fecha_inicio: item.fecha_inicio || '',
          fecha_fin: item.fecha_fin || ''
        })) || [],
        tendenciaDiaria: diarioResponse.data?.datos?.map(d => ({
          fecha: d.fecha,
          label: d.label,
          visitas: d.visitas
        })) || [],
        
        // Estadísticas generales
        estadisticas: {
          totalVisitas: statsResponse.data?.total_visitas || 0,
          promedioDiario: statsResponse.data?.promedio_diario || 0,
          tramiteMasComun: statsResponse.data?.tramite_mas_comun || 'No disponible',
          porcentajeCompletados: statsResponse.data?.porcentaje_completados || 0,
          municipioMasVisitado: statsResponse.data?.municipio_mas_visitado || 'No disponible',
          
          diasTranscurridos: statsResponse.data?.dias_transcurridos || 0
        }
      };

      console.debug('Datos transformados:', datosTransformados);
      setReportData(datosTransformados);
      
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError(`Error al cargar los datos del reporte: ${err.message || 'Error desconocido'}. Verifica que el backend esté corriendo en http://localhost:8000`);
      
      // Datos de ejemplo por si falla la API (para testing)
      setReportData({
        tiposTramites: [
          { name: 'Asesoría', value: 25, completados: 20, porcentaje_completados: 80, color: '#0088FE' },
          { name: 'Divorcio', value: 15, completados: 10, porcentaje_completados: 66.7, color: '#00C49F' },
          { name: 'Curatela', value: 8, completados: 6, porcentaje_completados: 75, color: '#FFBB28' }
        ],
        visitasMensuales: [
          { mes: 'Ene', visitas: 50, completados: 40 },
          { mes: 'Feb', visitas: 60, completados: 45 },
          { mes: 'Mar', visitas: 70, completados: 50 }
        ],
        tendenciaSemanal: [
          { semana: 'Sem 1', visitas: 15, promedio: 2.1 },
          { semana: 'Sem 2', visitas: 18, promedio: 2.6 },
          { semana: 'Sem 3', visitas: 22, promedio: 3.1 }
        ],
        estadisticas: {
          totalVisitas: 150,
          promedioDiario: 5.2,
          tramiteMasComun: 'Asesoría',
          porcentajeCompletados: 75.5,
          municipioMasVisitado: 'Caracas'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente o cambiar filtro
  useEffect(() => {
    cargarDatosReportes();
  }, [filtroFecha, municipioFiltro, tipoFiltro, referidoFiltro]);

  // Cargar opciones para selects (tipo de visita e instituciones)
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        const tipos = await tsjService.getOpcionesTipoVisita();
        const insts = await tsjService.getOpcionesInstituciones();
        const mun = await tsjService.getOpcionesMunicipios();
        setTipoOptions(tipos.data || tipos);
        setInstitucionesOptions(insts.data || insts);
        setMunicipiosOptions(mun.data || mun);
      } catch (e) {
        console.warn('No se pudieron cargar opciones:', e);
      }
    };
    cargarOpciones();
  }, []);

  // Sync advanced temp values when main filters change
  useEffect(() => {
    setAdvMunicipio(municipioFiltro || '');
    setAdvTipo(tipoFiltro || '');
    setAdvReferido(referidoFiltro || '');
  }, [municipioFiltro, tipoFiltro, referidoFiltro]);

  // Derived values and simple handlers
  const totalVisitas = (reportData.tiposTramites || []).reduce((s, i) => s + (i.value || 0), 0) || (reportData.estadisticas && reportData.estadisticas.totalVisitas) || 0;
  const promedioMensual = (reportData.visitasMensuales && reportData.visitasMensuales.length > 0)
    ? Math.round((reportData.visitasMensuales.reduce((s, i) => s + (i.visitas || 0), 0) / reportData.visitasMensuales.length))
    : 0;

  const handleRefresh = () => {
    cargarDatosReportes();
  };

  const handleExportarReporte = async (tipo) => {
    setLoading(true);
    try {
      const filters = { municipio: municipioFiltro, tipo_visita: tipoFiltro, referir_a: referidoFiltro };
      if (tipo === 'pdf') {
        console.debug('PDF export handler invoked — build id: reportes_pdf_v2');
        // Prefer backend PDF endpoint if available
        try {
          if (tsjService.exportarReportePDF) {
            const resp = await tsjService.exportarReportePDF(filtroFecha, filters);
            descargarArchivo(resp.data, `reporte.pdf`);
          } else {
            throw new Error('No backend PDF endpoint');
          }
        } catch (errPdf) {
          // Fallback: generate a neat PDF client-side using jsPDF
          try {
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 40;

            // Cover page with optional logo
            doc.setFillColor(26, 54, 93);
            doc.rect(0, 0, pageWidth, 90, 'F');
            doc.setTextColor(255);
            doc.setFontSize(18);
            doc.text('Tribunal Supremo de Justicia', pageWidth / 2, 45, { align: 'center' });
            doc.setFontSize(14);
            doc.text('Reporte de Visitas', pageWidth / 2, 68, { align: 'center' });

            // Try to load logo from public folder (/logo.png)
            try {
              const res = await fetch('/logo.png');
              if (res.ok) {
                const blob = await res.blob();
                const reader = await new Promise((resolve, reject) => {
                  const r = new FileReader();
                  r.onload = () => resolve(r.result);
                  r.onerror = reject;
                  r.readAsDataURL(blob);
                });
                // draw logo on cover
                doc.addImage(reader, 'PNG', pageWidth - 120, 10, 80, 60);
              }
            } catch (logoErr) {
              // ignore missing logo
            }

            doc.setTextColor(33);
            doc.setFontSize(10);
            doc.text(`Periodo: ${filtroFecha}`, margin, 120);
            doc.text(`Generado: ${new Date().toLocaleString()}`, pageWidth - margin, 120, { align: 'right' });
            doc.text(`Filtros: Municipio=${municipioFiltro || 'Todos'}  |  Trámite=${tipoFiltro || 'Todos'}  |  Referido=${referidoFiltro || 'Todos'}`, margin, 140, { maxWidth: pageWidth - margin * 2 });

            // Reserve a page for Table of Contents
            doc.addPage();
            const tocPageIndex = doc.getNumberOfPages();
            // we'll write TOC later on this page

            // Track sections for TOC
            const sections = [];

            // Add charts (section)
            let y = margin;
            sections.push({ title: 'Gráficos', page: doc.getNumberOfPages() + 1 });
            try {
              const chartEls = Array.from(document.querySelectorAll('.chart-wrapper')) || [];
              for (let i = 0; i < Math.min(chartEls.length, 3); i++) {
                const el = chartEls[i];
                if (!el) continue;
                let imgData = null;
                try {
                  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                  imgData = canvas.toDataURL('image/png');
                } catch (hcErr) {
                  console.warn('html2canvas failed for chart, will try SVG serialization', hcErr);
                }

                // If html2canvas didn't work, try serializing inner SVGs (Recharts uses SVG)
                if (!imgData) {
                  try {
                    const svg = el.querySelector('svg');
                    if (svg) {
                      const serializer = new XMLSerializer();
                      let svgString = serializer.serializeToString(svg);
                      // Add name space if missing
                      if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
                      }
                      const svg64 = encodeURIComponent(svgString);
                      const imgSrc = 'data:image/svg+xml;charset=utf-8,' + svg64;

                      // Draw the SVG onto a canvas to get PNG
                      const image = await new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        img.src = imgSrc;
                      });
                      const canvas = document.createElement('canvas');
                      canvas.width = image.width || (el.clientWidth * 2);
                      canvas.height = image.height || (el.clientHeight * 2);
                      const ctx = canvas.getContext('2d');
                      ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
                      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                      imgData = canvas.toDataURL('image/png');
                    }
                  } catch (svgErr) {
                    console.warn('SVG to image conversion failed:', svgErr);
                  }
                }

                if (imgData) {
                  const img = new Image();
                  img.src = imgData;
                  await new Promise((res) => { img.onload = res; img.onerror = res; });
                  const imgW = pageWidth - margin * 2;
                  const imgH = (img.height / img.width) * imgW || (el.clientHeight || 200);
                  if (y + imgH > pageHeight - margin) { doc.addPage(); y = margin; }
                  doc.addImage(imgData, 'PNG', margin, y, imgW, imgH);
                  y += imgH + 12;
                } else {
                  console.warn('No image data produced for chart element');
                }
              }
            } catch (imgErr) {
              console.warn('No se pudieron capturar gráficos para el PDF:', imgErr);
            }

            // Estadísticas principales
            sections.push({ title: 'Estadísticas principales', page: doc.getNumberOfPages() });
            const stats = reportData.estadisticas || {};
            const statsBody = [
              ['Total visitas', stats.totalVisitas || 0],
              ['Promedio diario', stats.promedioDiario || 0],
              ['Trámite más común', stats.tramiteMasComun || 'N/A'],
              ['Porcentaje completados', `${stats.porcentajeCompletados || 0}%`],
              ['Municipio más visitado', stats.municipioMasVisitado || 'N/A']
            ];
            if (y + 120 > pageHeight - margin) { doc.addPage(); y = margin; }
            doc.autoTable({
              startY: y,
              head: [['Estadística', 'Valor']],
              body: statsBody,
              theme: 'grid',
              headStyles: { fillColor: [26, 54, 93], textColor: 255, halign: 'center' },
              styles: { halign: 'left', cellPadding: 6, fontSize: 10 }
            });
            y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : y + 80;

            // Detalle por Trámite
            sections.push({ title: 'Detalle por Trámite', page: doc.getNumberOfPages() });
            const tramRows = (reportData.tiposTramites || []).map(t => [
              t.name || t.nombre || 'N/A',
              t.value || t.cantidad || 0,
              t.completados || 0,
              `${t.porcentaje_completados || t.porcentajeCompletados || 0}%`
            ]);
            if (y + 60 > pageHeight - margin) { doc.addPage(); y = margin; }
            doc.autoTable({
              startY: y,
              head: [['Trámite', 'Cantidad', 'Completados', '% Completados']],
              body: tramRows,
              theme: 'striped',
              headStyles: { fillColor: [44, 120, 87], textColor: 255 },
              styles: { fontSize: 10, cellPadding: 6 }
            });
            y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : y + 80;

            // Visitas mensuales
            sections.push({ title: 'Visitas Mensuales', page: doc.getNumberOfPages() });
            const visRows = (reportData.visitasMensuales || []).map(v => [v.mes || '', v.visitas || 0, v.completados || 0]);
            if (visRows.length > 0) {
              if (y + 60 > pageHeight - margin) { doc.addPage(); y = margin; }
              doc.autoTable({
                startY: y,
                head: [['Mes', 'Visitas', 'Completados']],
                body: visRows,
                theme: 'grid',
                headStyles: { fillColor: [66, 133, 244], textColor: 255 },
                styles: { fontSize: 10, cellPadding: 6 }
              });
            }

            // Now write the Table of Contents on reserved page (tocPageIndex)
            try {
              doc.setPage(tocPageIndex);
              doc.setFontSize(14);
              doc.text('Tabla de Contenidos', margin, 80);
              doc.setFontSize(11);
              let ty = 100;
              sections.forEach(s => {
                const line = `${s.title}`;
                doc.text(line, margin + 8, ty);
                doc.text(String(s.page), pageWidth - margin - 12, ty, { align: 'right' });
                ty += 18;
                if (ty > pageHeight - margin) { doc.addPage(); ty = margin; }
              });
            } catch (tocErr) {
              console.warn('No se pudo escribir TOC:', tocErr);
            }

            // Output blob and trigger download
            const pdfBlob = doc.output('blob');
            descargarArchivo(pdfBlob, 'reporte.pdf');
          } catch (genErr) {
            console.error('Error generando PDF cliente:', genErr);
            // last resort: download JSON
            const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
            descargarArchivo(blob, 'reporte.json');
          }
        }
      } else if (tipo === 'excel') {
        // Prefer backend Excel endpoint
        try {
          if (tsjService.exportarReporteExcel) {
            const resp = await tsjService.exportarReporteExcel(filtroFecha, filters);
            descargarArchivo(resp.data, `reporte.xlsx`);
          } else {
            // Fallback: generate a professional Excel client-side using SheetJS
            try {
              const wb = XLSX.utils.book_new();

              // Summary sheet with filters and stats
              const summary = [];
              summary.push({ Campo: 'Periodo', Valor: filtroFecha });
              summary.push({ Campo: 'Municipio', Valor: municipioFiltro || 'Todos' });
              summary.push({ Campo: 'Trámite', Valor: tipoFiltro || 'Todos' });
              summary.push({ Campo: 'Referido', Valor: referidoFiltro || 'Todos' });
              summary.push({ Campo: '', Valor: '' });
              const stats = reportData.estadisticas || {};
              summary.push({ Campo: 'Total visitas', Valor: stats.totalVisitas || 0 });
              summary.push({ Campo: 'Promedio diario', Valor: stats.promedioDiario || 0 });
              summary.push({ Campo: 'Trámite más común', Valor: stats.tramiteMasComun || 'N/A' });
              summary.push({ Campo: 'Porcentaje completados', Valor: `${stats.porcentajeCompletados || 0}%` });

              const wsSummary = XLSX.utils.json_to_sheet(summary, { header: ['Campo', 'Valor'] });
              XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

              // Detalle por trámite
              const tramites = (reportData.tiposTramites || []).map(t => ({
                Trámite: t.name || t.nombre || 'N/A',
                Cantidad: t.value || t.cantidad || 0,
                Completados: t.completados || 0,
                Porcentaje: t.porcentaje_completados || ''
              }));
              const wsTramites = XLSX.utils.json_to_sheet(tramites);
              XLSX.utils.book_append_sheet(wb, wsTramites, 'Trámites');

              // Visitas mensuales
              const visitas = (reportData.visitasMensuales || []).map(v => ({ Mes: v.mes, Visitas: v.visitas, Completados: v.completados }));
              const wsVisitas = XLSX.utils.json_to_sheet(visitas);
              XLSX.utils.book_append_sheet(wb, wsVisitas, 'VisitasMensuales');

              // Hoja de firmas
              const firmas = [
                { Coordinadora: '_______________________________', Directora: '_______________________________' },
                { Coordinadora: 'Coordinadora de Equipo de Justicia Social', Directora: 'Directora Administrativa Regional' }
              ];
              const wsFirmas = XLSX.utils.json_to_sheet(firmas, { header: ['Coordinadora', 'Directora'] });
              XLSX.utils.book_append_sheet(wb, wsFirmas, 'Firmas');

              const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
              const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              descargarArchivo(blob, `reporte.xlsx`);
            } catch (genXlsErr) {
              console.error('Error generando Excel cliente:', genXlsErr);
              const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
              descargarArchivo(blob, `reporte.json`);
            }
          }
        } catch (eExcel) {
          console.error('Error exportando Excel:', eExcel);
          const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
          descargarArchivo(blob, `reporte.json`);
        }
      }
    } catch (e) {
      console.error('Error exportando reporte:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="reports-header" style={{ width: '100%' }}>
        <div className="reports-actions">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Calendar size={16} />
            <select 
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="filter-select periodo-select"
              disabled={loading}
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="trimestre">Este trimestre</option>
              <option value="anio">Este año</option>
            </select>

            <button
              className={`btn-secondary btn-with-icon ${showAdvancedFilters ? 'active-filter' : ''}`}
              onClick={() => setShowAdvancedFilters(s => !s)}
              title="Mostrar filtros"
              aria-pressed={showAdvancedFilters}
            >
              <Filter size={16} />
              Filtros
            </button>
          </div>
        </div>

        <div className="reports-actions reports-actions-right" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}>
            <button 
              className="btn-secondary btn-with-icon btn-pdf" 
              onClick={() => handleExportarReporte('pdf')}
              disabled={loading}
            >
              <FileText size={16} color="#e53e3e" />
              PDF
            </button>

            <button 
              className="btn-primary btn-with-icon btn-excel" 
              onClick={() => handleExportarReporte('excel')}
              disabled={loading}
            >
              <FileText size={16} color="#16a34a" />
              Excel
            </button>
          </div>

          <button 
            className="btn-secondary btn-refresh"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

          {/* Advanced filters collapsed by default */}
          {showAdvancedFilters && (
            <div className="advanced-filters" style={{ marginTop: '0.75rem', width: '100%' }}>
              <div className="filter-group">
                <label>Ubicación (Municipio):</label>
                <select value={advMunicipio} onChange={(e) => setAdvMunicipio(e.target.value)}>
                  <option value="">Todos</option>
                  {municipiosOptions && municipiosOptions.map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Trámite:</label>
                <select value={advTipo} onChange={(e) => setAdvTipo(e.target.value)}>
                  <option value="">Todos</option>
                  {tipoOptions && tipoOptions.map((t, idx) => (
                    <option key={idx} value={t[0] || t.value || t}>{t[1] || t.label || t}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Referido:</label>
                <select value={advReferido} onChange={(e) => setAdvReferido(e.target.value)}>
                  <option value="">Todos</option>
                  {institucionesOptions && institucionesOptions.map((i, idx) => (
                    <option key={idx} value={i[0] || i.value || i}>{i[1] || i.label || i}</option>
                  ))}
                </select>
              </div>

              <div className="filter-actions" style={{ marginLeft: 'auto' }}>
                <button className="btn-secondary" onClick={() => {
                  setAdvMunicipio(''); setAdvTipo(''); setAdvReferido('');
                  setMunicipioFiltro(''); setTipoFiltro(''); setReferidoFiltro('');
                  setShowAdvancedFilters(false);
                }}>Limpiar</button>

                <button className="btn-primary" onClick={() => {
                  setMunicipioFiltro(advMunicipio || '');
                  setTipoFiltro(advTipo || '');
                  setReferidoFiltro(advReferido || '');
                  setShowAdvancedFilters(false);
                }}>Aplicar</button>
              </div>
            </div>
          )}
          
          {/* Removed duplicate refresh block; the button is now in the header */}

          {/* Export buttons are in the header; duplicate removed */}
          

      {error && (
        <div className="alert alert-warning">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f6' }}>
            <Users size={20} />
          </div>
          <div className="stat-content">
            <h3>Total Visitas</h3>
            <p className="stat-number">{reportData.estadisticas.totalVisitas.toLocaleString()}</p>
            <p className="stat-change">Período actual</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b981' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <h3>Promedio Diario</h3>
            <p className="stat-number">{reportData.estadisticas.promedioDiario}</p>
            <p className="stat-change">visitantes por día</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b' }}>
            <PieChartIcon size={20} />
          </div>
          <div className="stat-content">
            <h3>Trámite más Común</h3>
            <p className="stat-number">{reportData.estadisticas.tramiteMasComun}</p>
            <p className="stat-change">más frecuente</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#8b5cf6' }}>
            <BarChart2 size={20} />
          </div>
          <div className="stat-content">
            <h3>Completados</h3>
            <p className="stat-number">{reportData.estadisticas.porcentajeCompletados}%</p>
            <p className="stat-change">de trámites finalizados</p>
          </div>
        </div>
      </div>

      {/* Mini gráfico diario */}
      <div className="daily-trend">
        <div className="chart-header">
          <h4><TrendingUp size={16} /> Últimos 14 días</h4>
          <span className="chart-subtitle">Visitas por día</span>
        </div>
        <div className="chart-wrapper small">
          {reportData.tendenciaDiaria.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={reportData.tendenciaDiaria} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip formatter={(value) => `${value} visitas`} />
                <Line type="monotone" dataKey="visitas" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data"><p>No hay datos diarios</p></div>
          )}
        </div>
      </div>

      {/* Sección de Gráficos */}
      <div className="charts-section">
        {/* Gráfico de torta - Distribución de trámites */}
        <div className="chart-container full-width">
          <div className="chart-header">
            <h3><PieChartIcon size={20} /> Distribución de Trámites</h3>
            <span className="chart-subtitle">Por tipo de visita</span>
          </div>
          <div className="chart-wrapper">
            {reportData.tiposTramites.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.tiposTramites}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportData.tiposTramites.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const item = props.payload;
                      return [
                        `Cantidad: ${value}`,
                        `Completados: ${item.completados || 0}`,
                        `Porcentaje completados: ${item.porcentaje_completados || 0}%`
                      ];
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>No hay datos de trámites disponibles</p>
              </div>
            )}
          </div>
          <div className="chart-footer">
            <p>Total: {totalVisitas} visitas</p>
            <p className="text-sm text-gray-500">Período: {filtroFecha}</p>
          </div>
        </div>

        {/* Gráfico de barras - Visitantes por mes */}
        <div className="chart-container full-width">
          <div className="chart-header">
            <h3><BarChart2 size={20} /> Visitantes por Mes</h3>
            <span className="chart-subtitle">Últimos 6 meses</span>
          </div>
          <div className="chart-wrapper">
            {reportData.visitasMensuales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={reportData.visitasMensuales}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visitas" name="Total Visitantes" fill="#3b82f6" />
                  <Bar dataKey="completados" name="Completados" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>No hay datos mensuales disponibles</p>
              </div>
            )}
          </div>
          <div className="chart-footer">
            <p>Promedio mensual: {promedioMensual} visitas</p>
          </div>
        </div>

        {/* Gráfico de líneas - Tendencia semanal */}
        <div className="chart-container full-width">
          <div className="chart-header">
            <h3><TrendingUp size={20} /> Tendencia Semanal</h3>
            <span className="chart-subtitle">Últimas 6 semanas</span>
          </div>
          <div className="chart-wrapper">
            {reportData.tendenciaSemanal.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={reportData.tendenciaSemanal}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'promedio') return [`${value} visitas/día`, 'Promedio diario'];
                      return [`${value} visitas`, name];
                    }}
                    labelFormatter={(label, items) => {
                      if (items && items[0]) {
                        const data = items[0].payload;
                        return `${label} (${data.fecha_inicio || ''} - ${data.fecha_fin || ''})`;
                      }
                      return label;
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="visitas"
                    name="Visitas totales"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="promedio"
                    name="Promedio diario"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>No hay datos de tendencia disponibles</p>
              </div>
            )}
          </div>
          <div className="chart-footer">
            <p>
              {reportData.tendenciaSemanal.length > 1 && 
                `Período: ${reportData.tendenciaSemanal[0]?.fecha_inicio || ''} - ${reportData.tendenciaSemanal[reportData.tendenciaSemanal.length - 1]?.fecha_fin || ''}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de datos detallados */}
      <div className="detailed-table">
        <div className="table-header">
          <h3>Detalle de Visitantes por Trámite</h3>
          <span className="table-subtitle">Período: {filtroFecha}</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo de Trámite</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
                <th>Tasa de Completados</th>
                <th>Completados</th>
              </tr>
            </thead>
            <tbody>
              {reportData.tiposTramites.map((tramite, index) => {
                const porcentaje = totalVisitas > 0 
                  ? ((tramite.value / totalVisitas) * 100).toFixed(1)
                  : 0;
                
                return (
                  <tr key={index}>
                    <td>
                      <div className="tramite-info">
                        <div className="color-dot" style={{ 
                          backgroundColor: tramite.color || COLORS[index % COLORS.length] 
                        }}></div>
                        <span>{tramite.name}</span>
                      </div>
                    </td>
                    <td><strong>{tramite.value}</strong></td>
                    <td>{porcentaje}%</td>
                    <td>
                      <span className={`tasa-badge ${tramite.porcentaje_completados > 70 ? 'high' : 'low'}`}>
                        {tramite.porcentaje_completados || 0}%
                      </span>
                    </td>
                    <td>{tramite.completados || 0}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>TOTAL</strong></td>
                <td><strong>{totalVisitas}</strong></td>
                <td><strong>100%</strong></td>
                <td><strong>{reportData.estadisticas.porcentajeCompletados}%</strong></td>
                <td>
                  <strong>{reportData.tiposTramites.reduce((sum, item) => sum + (item.completados || 0), 0)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Información adicional */}
      <div className="reports-notes">
        <h4>Información del Reporte</h4>
        <ul>
          <li>📊 <strong>Datos reales de la base de datos</strong></li>
          <li>🔄 <strong>Actualización en tiempo real</strong> al cambiar filtros</li>
          <li>📅 <strong>Períodos disponibles:</strong> Hoy, Semana, Mes, Trimestre, Año</li>
          <li>💾 <strong>Exportación:</strong> PDF y Excel con datos completos</li>
          <li>⏱️ <strong>Última actualización:</strong> {new Date().toLocaleString()}</li>
          <li>📍 <strong>Municipio más visitado:</strong> {reportData.estadisticas.municipioMasVisitado}</li>
              {/* Hora pico removed per request */}
        </ul>
      </div>
    </>
  );
};

export default Reportes;