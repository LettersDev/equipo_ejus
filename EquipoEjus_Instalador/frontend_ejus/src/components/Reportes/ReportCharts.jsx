import React, { Suspense } from 'react';
import { PieChart as PieChartIcon, BarChart2, TrendingUp } from 'lucide-react';
import {
    ResponsiveContainer, PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, LineChart, Line
} from 'recharts';

const ChartSkeleton = () => (
    <div className="chart-skeleton" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: '8px' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginLeft: '1rem', color: '#6b7280' }}>Cargando gráfico...</p>
    </div>
);

const ReportCharts = ({
    tiposTramites,
    visitasMensuales,
    tendenciaSemanal,
    tendenciaDiaria,
    totalVisitas,
    filtroFecha,
    promedioMensual,
    COLORS
}) => {
    return (
        <Suspense fallback={<div className="loading-container">Cargando visualizaciones...</div>}>
            {/* Mini gráfico diario */}
            <div className="daily-trend">
                <div className="chart-header">
                    <h4><TrendingUp size={16} /> Últimos 14 días</h4>
                    <span className="chart-subtitle">Visitas por día</span>
                </div>
                <div className="chart-wrapper small">
                    {tendenciaDiaria && tendenciaDiaria.length > 0 ? (
                        <ResponsiveContainer width="100%" height={120}>
                            <LineChart data={tendenciaDiaria} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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

            <div className="charts-section">
                {/* Gráfico de torta - Distribución de trámites */}
                <div className="chart-container full-width">
                    <div className="chart-header">
                        <h3><PieChartIcon size={20} /> Distribución de Trámites</h3>
                        <span className="chart-subtitle">Por tipo de visita</span>
                    </div>
                    <div className="chart-wrapper">
                        {tiposTramites && tiposTramites.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={tiposTramites}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {tiposTramites.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
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
                        {visitasMensuales && visitasMensuales.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={visitasMensuales}
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
                        {tendenciaSemanal && tendenciaSemanal.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart
                                    data={tendenciaSemanal}
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
                            {tendenciaSemanal && tendenciaSemanal.length > 1 &&
                                `Período: ${tendenciaSemanal[0]?.fecha_inicio || ''} - ${tendenciaSemanal[tendenciaSemanal.length - 1]?.fecha_fin || ''}`
                            }
                        </p>
                    </div>
                </div>
            </div>
        </Suspense>
    );
};

export default ReportCharts;
