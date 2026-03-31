import React from 'react';
import { FileText, Download, RefreshCw } from 'lucide-react';

const ReportHeader = ({
    loading,
    handleVisualizarReporte,
    handleExportarPDF,
    handleRefresh
}) => {
    return (
        <div className="reports-header" style={{ width: '100%' }}>
            <div className="header-title-section">
                {/* Aquí podría ir un título si fuera necesario, pero mantenemos la estructura actual */}
            </div>

            <div className="reports-actions reports-actions-right" style={{ alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}>
                    <button
                        className="btn-primary btn-with-icon"
                        onClick={handleVisualizarReporte}
                        disabled={loading}
                        title="Ver reporte sin descargar"
                    >
                        <FileText size={16} />
                        Vista Previa
                    </button>

                    <button
                        className="btn-secondary btn-with-icon"
                        onClick={handleExportarPDF}
                        disabled={loading}
                        title="Descargar reporte PDF"
                    >
                        <Download size={16} />
                        Descargar PDF
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
    );
};

export default ReportHeader;
