import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuditPagination({ page, setPage, totalPages }) {
    if (totalPages <= 1) return null;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid var(--border-color, #e2e8f0)',
            background: 'var(--table-header-bg, #f8fafc)',
            borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px',
        }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Página {page} de {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
                <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{
                        padding: '5px 12px', border: '1px solid #e2e8f0', borderRadius: '7px',
                        background: page <= 1 ? '#f8fafc' : '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                        color: page <= 1 ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.82rem', fontWeight: 600, transition: 'background-color 0.2s, color 0.2s',
                    }}
                >
                    <ChevronLeft size={15} /> Anterior
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p;
                    if (totalPages <= 5) {
                        p = i + 1;
                    } else if (page <= 3) {
                        p = i + 1;
                    } else if (page >= totalPages - 2) {
                        p = totalPages - 4 + i;
                    } else {
                        p = page - 2 + i;
                    }
                    return (
                        <button
                            key={`btn-page-${p}`}
                            onClick={() => setPage(p)}
                            style={{
                                padding: '5px 11px', border: '1px solid',
                                borderColor: p === page ? '#1d4ed8' : '#e2e8f0',
                                borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                                background: p === page ? '#1d4ed8' : '#fff',
                                color: p === page ? '#fff' : '#475569',
                                transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
                            }}
                        >
                            {p}
                        </button>
                    );
                })}

                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    style={{
                        padding: '5px 12px', border: '1px solid #e2e8f0', borderRadius: '7px',
                        background: page >= totalPages ? '#f8fafc' : '#fff',
                        cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                        color: page >= totalPages ? '#cbd5e1' : '#475569',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.82rem', fontWeight: 600, transition: 'background-color 0.2s, color 0.2s',
                    }}
                >
                    Siguiente <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}
