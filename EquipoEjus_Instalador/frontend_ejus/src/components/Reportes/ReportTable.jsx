import React from 'react';

const ReportTable = ({ tiposTramites, totalVisitas, filtroFecha, porcentajeCompletados, COLORS }) => {
    return (
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
                        {tiposTramites.map((tramite, index) => {
                            const porcentaje = totalVisitas > 0
                                ? ((tramite.value / totalVisitas) * 100).toFixed(1)
                                : 0;

                            return (
                                <tr key={`tramite-${tramite.name}`}>
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
                            <td><strong>{porcentajeCompletados}%</strong></td>
                            <td>
                                <strong>{tiposTramites.reduce((sum, item) => sum + (item.completados || 0), 0)}</strong>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default ReportTable;
