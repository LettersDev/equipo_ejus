import React, { useReducer, useEffect, useCallback } from 'react';
import { tsjService } from '../services/api';
import AuditHeader from '../components/Auditoria/AuditHeader';
import AuditFilters from '../components/Auditoria/AuditFilters';
import AuditTable from '../components/Auditoria/AuditTable';
import AuditPagination from '../components/Auditoria/AuditPagination';

const PAGE_SIZE = 20;

const initialState = {
    logs: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    filters: {
        usuario: '',
        accion: '',
        fecha_desde: '',
        fecha_hasta: '',
    },
    applied: {},
};

function auditReducer(state, action) {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false,
                logs: action.payload.logs,
                total: action.payload.total
            };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload, logs: [], total: 0 };
        case 'SET_PAGE':
            return { ...state, page: action.payload };
        case 'UPDATE_FILTER':
            return { ...state, filters: { ...state.filters, [action.field]: action.value } };
        case 'APPLY_FILTERS':
            return { ...state, applied: action.payload, page: 1 };
        case 'CLEAR_FILTERS':
            return {
                ...state,
                filters: initialState.filters,
                applied: {},
                page: 1
            };
        default:
            return state;
    }
}

export default function Auditoria() {
    const [state, dispatch] = useReducer(auditReducer, initialState);
    const { logs, loading, error, total, page, filters, applied } = state;

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const fetchLogs = useCallback(async (currentPage, appliedFilters) => {
        dispatch({ type: 'FETCH_START' });
        try {
            const params = {
                page: currentPage,
                page_size: PAGE_SIZE,
                ...appliedFilters,
            };
            // Limpiar params vacíos
            Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });

            const data = await tsjService.getAuditLogs(params);
            if (data && typeof data.count !== 'undefined') {
                dispatch({ type: 'FETCH_SUCCESS', payload: { logs: data.results || [], total: data.count } });
            } else if (Array.isArray(data)) {
                dispatch({ type: 'FETCH_SUCCESS', payload: { logs: data, total: data.length } });
            } else {
                dispatch({ type: 'FETCH_SUCCESS', payload: { logs: [], total: 0 } });
            }
        } catch (err) {
            dispatch({ type: 'FETCH_ERROR', payload: 'Error al cargar los registros de auditoría.' });
        }
    }, []);

    useEffect(() => {
        fetchLogs(page, applied);
    }, [page, applied, fetchLogs]);

    const handleFiltrar = () => {
        const f = {};
        if (filters.usuario.trim()) f.usuario = filters.usuario.trim();
        if (filters.accion) f.accion = filters.accion;
        if (filters.fecha_desde) f.fecha_desde = filters.fecha_desde;
        if (filters.fecha_hasta) f.fecha_hasta = filters.fecha_hasta;
        dispatch({ type: 'APPLY_FILTERS', payload: f });
    };

    const handleLimpiar = () => {
        dispatch({ type: 'CLEAR_FILTERS' });
    };

    const setPage = (p) => dispatch({ type: 'SET_PAGE', payload: p });

    return (
        <div className="auditoria-page" style={{ padding: '1.5rem 2rem' }}>
            <AuditHeader
                onRefresh={() => fetchLogs(page, applied)}
                loading={loading}
            />

            <AuditFilters
                filtroUsuario={filters.usuario}
                setFiltroUsuario={(v) => dispatch({ type: 'UPDATE_FILTER', field: 'usuario', value: v })}
                filtroAccion={filters.accion}
                setFiltroAccion={(v) => dispatch({ type: 'UPDATE_FILTER', field: 'accion', value: v })}
                filtroFechaDesde={filters.fecha_desde}
                setFiltroFechaDesde={(v) => dispatch({ type: 'UPDATE_FILTER', field: 'fecha_desde', value: v })}
                filtroFechaHasta={filters.fecha_hasta}
                setFiltroFechaHasta={(v) => dispatch({ type: 'UPDATE_FILTER', field: 'fecha_hasta', value: v })}
                onFiltrar={handleFiltrar}
                onLimpiar={handleLimpiar}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {loading ? 'Cargando...' : `${total.toLocaleString('es-VE')} registro${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
                </span>
                {Object.keys(applied).length > 0 && (
                    <span style={{
                        fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af',
                        padding: '2px 10px', borderRadius: '999px', fontWeight: 600,
                    }}>
                        Filtros activos
                    </span>
                )}
            </div>

            <AuditTable
                logs={logs}
                loading={loading}
                error={error}
                page={page}
                pageSize={PAGE_SIZE}
            />

            <AuditPagination
                page={page}
                setPage={setPage}
                totalPages={totalPages}
            />
        </div>
    );
}
