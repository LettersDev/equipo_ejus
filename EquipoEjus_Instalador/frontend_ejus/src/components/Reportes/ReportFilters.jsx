import React, { useState, useEffect } from 'react';
import { Calendar, Filter } from 'lucide-react';

const ReportFilters = ({
    loading,
    filtroFecha,
    setFiltroFecha,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    municipioFiltro,
    setMunicipioFiltro,
    tipoFiltro,
    setTipoFiltro,
    referidoFiltro,
    setReferidoFiltro,
    municipiosOptions,
    tipoOptions,
    institucionesOptions
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Estado interno temporal para los filtros avanzados (Evita el error de Derived State en useEffect)
    const [tempMunicipio, setTempMunicipio] = useState(municipioFiltro || '');
    const [tempTipo, setTempTipo] = useState(tipoFiltro || '');
    const [tempReferido, setTempReferido] = useState(referidoFiltro || '');

    // Sincronizar solo cuando se abre/cierra o cambian los filtros externos
    useEffect(() => {
        if (showAdvanced) {
            setTempMunicipio(municipioFiltro || '');
            setTempTipo(tipoFiltro || '');
            setTempReferido(referidoFiltro || '');
        }
    }, [showAdvanced, municipioFiltro, tipoFiltro, referidoFiltro]);

    const handleApply = () => {
        setMunicipioFiltro(tempMunicipio);
        setTipoFiltro(tempTipo);
        setReferidoFiltro(tempReferido);
        setShowAdvanced(false);
    };

    const handleClear = () => {
        setTempMunicipio('');
        setTempTipo('');
        setTempReferido('');
        setMunicipioFiltro('');
        setTipoFiltro('');
        setReferidoFiltro('');
        setShowAdvanced(false);
    };

    return (
        <div className="report-filters-container" style={{ width: '100%', marginBottom: '1rem' }}>
            <div className="reports-header-filters" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <div className="filter-item-with-label">
                        <label htmlFor="filtro-periodo" className="sr-only">Período de tiempo</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} />
                            <select
                                id="filtro-periodo"
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
                                <option value="personalizado">Personalizado</option>
                            </select>
                        </div>
                    </div>

                    {filtroFecha === 'personalizado' && (
                        <div className="date-range-inputs" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div className="filter-item-with-label">
                                <label htmlFor="fecha-desde-rpt" className="sr-only">Desde</label>
                                <input
                                    id="fecha-desde-rpt"
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                    className="filter-date-input"
                                    title="Fecha Inicio"
                                />
                            </div>
                            <span className="date-separator">-</span>
                            <div className="filter-item-with-label">
                                <label htmlFor="fecha-hasta-rpt" className="sr-only">Hasta</label>
                                <input
                                    id="fecha-hasta-rpt"
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                    className="filter-date-input"
                                    title="Fecha Fin"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        className={`btn-secondary btn-with-icon ${showAdvanced ? 'active-filter' : ''}`}
                        onClick={() => setShowAdvanced(s => !s)}
                        title="Mostrar filtros avanzados"
                        aria-pressed={showAdvanced}
                    >
                        <Filter size={16} />
                        Filtros
                    </button>
                </div>
            </div>

            {showAdvanced && (
                <div className="advanced-filters" style={{ marginTop: '0.75rem', width: '100%' }}>
                    <div className="filter-group">
                        <label htmlFor="adv-mun">Ubicación (Municipio):</label>
                        <select id="adv-mun" value={tempMunicipio} onChange={(e) => setTempMunicipio(e.target.value)}>
                            <option value="">Todos</option>
                            {municipiosOptions && municipiosOptions.map((m) => (
                                <option key={`mun-${m}`} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="adv-tipo-rpt">Trámite:</label>
                        <select id="adv-tipo-rpt" value={tempTipo} onChange={(e) => setTempTipo(e.target.value)}>
                            <option value="">Todos</option>
                            {tipoOptions && tipoOptions.map((t) => {
                                const val = t[0] || t.value || t;
                                const label = t[1] || t.label || t;
                                return <option key={`tipo-${val}`} value={val}>{label}</option>;
                            })}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="adv-ref-rpt">Referido:</label>
                        <select id="adv-ref-rpt" value={tempReferido} onChange={(e) => setTempReferido(e.target.value)}>
                            <option value="">Todos</option>
                            {institucionesOptions && institucionesOptions.map((i) => {
                                const val = i[0] || i.value || i;
                                const label = i[1] || i.label || i;
                                return <option key={`ref-${val}`} value={val}>{label}</option>;
                            })}
                        </select>
                    </div>

                    <div className="filter-actions" style={{ marginLeft: 'auto' }}>
                        <button className="btn-secondary" onClick={handleClear}>Limpiar</button>
                        <button className="btn-primary" onClick={handleApply}>Aplicar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportFilters;
