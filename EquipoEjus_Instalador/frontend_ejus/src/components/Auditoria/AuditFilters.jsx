import React from 'react';
import { Search, Filter, User, Clock } from 'lucide-react';

const ACCIONES_FILTRO = [
    { value: '', label: 'Todas las acciones' },
    { value: 'CREATE', label: 'Crear' },
    { value: 'UPDATE', label: 'Editar' },
    { value: 'DELETE', label: 'Eliminar' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'REPORT', label: 'Reporte' },
];

export default function AuditFilters({
    filtroUsuario, setFiltroUsuario,
    filtroAccion, setFiltroAccion,
    filtroFechaDesde, setFiltroFechaDesde,
    filtroFechaHasta, setFiltroFechaHasta,
    onFiltrar, onLimpiar
}) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') onFiltrar();
    };

    return (
        <div className="audit-filters" style={{
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '12px',
            padding: '1.1rem 1.4rem',
            marginBottom: '1.2rem',
            display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
            {/* Buscar usuario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '180px', flex: '1 1 180px' }}>
                <label htmlFor="user-filter" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} /> Usuario
                </label>
                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        id="user-filter"
                        type="text"
                        placeholder="Buscar usuario..."
                        value={filtroUsuario}
                        onChange={e => setFiltroUsuario(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{
                            width: '100%', paddingLeft: '30px', paddingRight: '8px',
                            paddingTop: '7px', paddingBottom: '7px',
                            border: '1px solid #e2e8f0', borderRadius: '8px',
                            fontSize: '0.83rem', outline: 'none', boxSizing: 'border-box',
                            background: '#f8fafc', color: '#1e293b',
                        }}
                    />
                </div>
            </div>

            {/* Acción */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px', flex: '1 1 140px' }}>
                <label htmlFor="action-filter" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Filter size={12} /> Tipo de acción
                </label>
                <select
                    id="action-filter"
                    value={filtroAccion}
                    onChange={e => setFiltroAccion(e.target.value)}
                    style={{
                        padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '8px',
                        fontSize: '0.83rem', background: '#f8fafc', color: '#1e293b', outline: 'none', cursor: 'pointer'
                    }}
                >
                    {ACCIONES_FILTRO.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                </select>
            </div>

            {/* Fecha desde */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '145px', flex: '1 1 130px' }}>
                <label htmlFor="date-from-filter" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Desde
                </label>
                <input
                    id="date-from-filter"
                    type="date"
                    value={filtroFechaDesde}
                    onChange={e => setFiltroFechaDesde(e.target.value)}
                    style={{
                        padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '8px',
                        fontSize: '0.83rem', background: '#f8fafc', color: '#1e293b', outline: 'none'
                    }}
                />
            </div>

            {/* Fecha hasta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '145px', flex: '1 1 130px' }}>
                <label htmlFor="date-to-filter" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Hasta
                </label>
                <input
                    id="date-to-filter"
                    type="date"
                    value={filtroFechaHasta}
                    onChange={e => setFiltroFechaHasta(e.target.value)}
                    style={{
                        padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '8px',
                        fontSize: '0.83rem', background: '#f8fafc', color: '#1e293b', outline: 'none'
                    }}
                />
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <button
                    onClick={onFiltrar}
                    style={{
                        padding: '7px 18px', background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
                        color: '#fff', border: 'none', borderRadius: '8px',
                        fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                    <Search size={14} /> Filtrar
                </button>
                <button
                    onClick={onLimpiar}
                    style={{
                        padding: '7px 14px', background: '#f1f5f9',
                        color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px',
                        fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer', transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                    Limpiar
                </button>
            </div>
        </div>
    );
}
