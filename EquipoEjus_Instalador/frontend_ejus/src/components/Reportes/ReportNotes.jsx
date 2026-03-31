import React from 'react';

const ReportNotes = () => {
    return (
        <div className="reports-notes">
            <h4>Información del Reporte</h4>
            <ul>
                <li>📊 <strong>Datos reales</strong> obtenidos de la base de datos</li>
                <li>🔄 <strong>Actualización automática</strong> al aplicar filtros</li>
                <li>📅 <strong>Rango adaptativo:</strong> Soporte para fechas personalizadas</li>
                <li>💾 <strong>Exportación:</strong> PDF profesional de alta resolución</li>
                <li>⏱️ <strong>Generado el:</strong> {new Date().toLocaleString()}</li>
            </ul>
        </div>
    );
};

export default ReportNotes;
