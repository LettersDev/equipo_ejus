import React from 'react';
import { Clock, Globe, FileText } from 'lucide-react';

const ACCION_CONFIG = {
    CREATE: { label: 'CREAR', bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
    UPDATE: { label: 'EDITAR', bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
    DELETE: { label: 'ELIMINAR', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
    LOGIN: { label: 'LOGIN', bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
    LOGOUT: { label: 'LOGOUT', bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
    REPORT: { label: 'REPORTE', bg: '#fff7ed', color: '#c2410c', border: '#fdba74' },
};

const formatFecha = (fechaStr) => {
    if (!fechaStr) return '—';
    const d = new Date(fechaStr);
    return d.toLocaleString('es-VE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const AccionBadge = ({ accion }) => {
    const cfg = ACCION_CONFIG[accion] || { label: accion, bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
        }}>
            {cfg.label}
        </span>
    );
};

export default function AuditTable({ logs, loading, error, page, pageSize }) {
    if (error) {
        return (
            <div style={{ padding: '1.5rem', color: '#dc2626', background: '#fef2f2', textAlign: 'center', fontSize: '0.88rem' }}>
                {error}
            </div>
        );
    }

    return (
        <div style={{
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '12px', overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--table-header-bg, #f8fafc)', borderBottom: '2px solid var(--border-color, #e2e8f0)' }}>
                            {['#', 'Usuario', 'Acción', 'Módulo', 'Descripción', 'Fecha', 'IP'].map((col) => (
                                <th key={col} style={{
                                    padding: '11px 14px', textAlign: 'left', fontWeight: 700,
                                    color: 'var(--text-secondary, #64748b)', fontSize: '0.75rem', letterSpacing: '0.04em',
                                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                                }}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
                                        <span>Cargando registros...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && logs.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={36} style={{ opacity: 0.3 }} />
                                        <span style={{ fontSize: '0.9rem' }}>No hay registros de auditoría que mostrar.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && logs.map((log, idx) => (
                            <tr
                                key={log.id}
                                style={{
                                    borderBottom: '1px solid var(--border-color, #f1f5f9)',
                                    transition: 'background-color 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--row-hover, #f8fafc)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                    {(page - 1) * pageSize + idx + 1}
                                </td>
                                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                                        }}>
                                            {(log.usuario || '?')[0].toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary, #1e293b)' }}>
                                            {log.usuario || <span style={{ color: '#94a3b8' }}>—</span>}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                                    <AccionBadge accion={log.accion} />
                                </td>
                                <td style={{ padding: '10px 14px', color: 'var(--text-secondary, #64748b)', whiteSpace: 'nowrap' }}>
                                    {log.modulo || '—'}
                                </td>
                                <td style={{ padding: '10px 14px', color: 'var(--text-primary, #1e293b)', maxWidth: 360 }}>
                                    {log.descripcion || '—'}
                                </td>
                                <td style={{ padding: '10px 14px', color: 'var(--text-secondary, #64748b)', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Clock size={12} style={{ flexShrink: 0, color: '#94a3b8' }} />
                                        {formatFecha(log.fecha)}
                                    </div>
                                </td>
                                <td style={{ padding: '10px 14px', color: 'var(--text-secondary, #64748b)', whiteSpace: 'nowrap', fontSize: '0.76rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Globe size={11} style={{ flexShrink: 0, color: '#94a3b8' }} />
                                        {log.ip || '—'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
