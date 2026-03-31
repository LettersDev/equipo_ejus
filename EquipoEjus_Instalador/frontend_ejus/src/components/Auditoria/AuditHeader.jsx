import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';

export default function AuditHeader({ onRefresh, loading }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{
                background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
                borderRadius: '10px', padding: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Shield size={22} color="#fff" />
            </div>
            <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary, #1e293b)' }}>
                    Auditoría del Sistema
                </h2>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)' }}>
                    Registro completo de acciones realizadas por los usuarios
                </p>
            </div>
            <button
                onClick={onRefresh}
                disabled={loading}
                title="Actualizar"
                style={{
                    marginLeft: 'auto', background: 'transparent', border: '1px solid #e2e8f0',
                    borderRadius: '8px', padding: '7px 12px', cursor: loading ? 'wait' : 'pointer',
                    color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '0.82rem', transition: 'background-color 0.2s, color 0.2s',
                    opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
            >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Cargando...' : 'Actualizar'}
            </button>
        </div>
    );
}
