import React from 'react';
import { Users, TrendingUp, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';

const ReportStats = ({ estadisticas }) => {
    return (
        <div className="quick-stats">
            <div className="stat-card">
                <div className="stat-icon" style={{ background: '#3b82f6' }}>
                    <Users size={20} />
                </div>
                <div className="stat-content">
                    <h3>Total Visitas</h3>
                    <p className="stat-number">{estadisticas.totalVisitas?.toLocaleString() || 0}</p>
                    <p className="stat-change">Período actual</p>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon" style={{ background: '#10b981' }}>
                    <TrendingUp size={20} />
                </div>
                <div className="stat-content">
                    <h3>Promedio Diario</h3>
                    <p className="stat-number">{estadisticas.promedioDiario || 0}</p>
                    <p className="stat-change">visitantes por día</p>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon" style={{ background: '#f59e0b' }}>
                    <PieChartIcon size={20} />
                </div>
                <div className="stat-content">
                    <h3>Trámite más Común</h3>
                    <p className="stat-number">{estadisticas.tramiteMasComun || 'N/A'}</p>
                    <p className="stat-change">más frecuente</p>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon" style={{ background: '#8b5cf6' }}>
                    <BarChart2 size={20} />
                </div>
                <div className="stat-content">
                    <h3>Completados</h3>
                    <p className="stat-number">{estadisticas.porcentajeCompletados || 0}%</p>
                    <p className="stat-change">de trámites finalizados</p>
                </div>
            </div>
        </div>
    );
};

export default ReportStats;
