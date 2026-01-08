import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Crear instancia de axios con configuraciones
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Helper to read token safely
const getToken = () => {
    try {
        const auth = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return auth?.token || localStorage.getItem('authToken') || null;
    } catch (e) {
        return localStorage.getItem('authToken') || null;
    }
};

// Request interceptor to add Authorization header when token is present
api.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Token ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
    response => response,
    error => {
        // If unauthorized, clear stored tokens to force re-login
        const status = error?.response?.status;
        if (status === 401) {
            try {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('authToken');
            } catch (e) {
                // ignore
            }
        }
        console.debug('Error en API:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const tsjService = {
    // Visitantes
    getVisitantes: (params) => api.get('/visitantes/', { params }),
    getVisitante: (id) => api.get(`/visitantes/${id}/`),
    createVisitante: (data) => api.post('/visitantes/', data),
    updateVisitante: (id, data) => api.put(`/visitantes/${id}/`, data),
    deleteVisitante: (id) => api.delete(`/visitantes/${id}/`),
    registrarSalida: (id) => api.post(`/visitantes/${id}/registrar-salida/`), // Cambiado a kebab-case

    // Estadísticas del dashboard
    getEstadisticasDashboard: () => api.get('/dashboard/estadisticas/'), // Ruta corregida
    getEstadisticas: () => api.get('/visitantes/estadisticas/'), // Esta es diferente a la del dashboard

    // Opciones para formularios
    getOpcionesTipoVisita: () => api.get('/opciones/tipos-visita/'),
    getOpcionesInstituciones: () => api.get('/opciones/instituciones/'),
    getOpcionesMunicipios: () => api.get('/opciones/municipios/'),

    // Reportes - RUTAS ACTUALIZADAS
    getTramitesReporte: async (periodo = 'mes', filters = {}) => {
        try {
            const params = { periodo, ...filters };
            const response = await api.get('/reportes/tramites/', { params });
            return response;
        } catch (error) {
            console.error('Error obteniendo reporte de trámites:', error);
            throw error;
        }
    },

    getVisitasMensuales: async (filters = {}) => {
        try {
            const response = await api.get('/reportes/visitas-mensuales/', { params: filters });
            return response;
        } catch (error) {
            console.error('Error obteniendo visitas mensuales:', error);
            throw error;
        }
    },

    getTendenciaSemanal: async (filters = {}) => {
        try {
            const response = await api.get('/reportes/tendencia-semanal/', { params: filters });
            return response;
        } catch (error) {
            console.error('Error obteniendo tendencia semanal:', error);
            throw error;
        }
    },

    getTendenciaDiaria: async (days = 14, filters = {}) => {
        try {
            const params = { days, ...filters };
            const response = await api.get('/reportes/diario/', { params });
            return response;
        } catch (error) {
            console.error('Error obteniendo tendencia diaria:', error);
            throw error;
        }
    },

    getEstadisticasReporte: async (filters = {}) => {
        try {
            const response = await api.get('/reportes/estadisticas/', { params: filters });
            return response;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    },

    // Nuevo: Reporte de referidos a instituciones
    getReporteReferidos: async (periodo = 'mes') => {
        try {
            const response = await api.get('/reportes/referidos/', {
                params: { periodo }
            });
            return response;
        } catch (error) {
            console.error('Error obteniendo reporte de referidos:', error);
            throw error;
        }
    },

    // Nuevo: Estadísticas específicas de referidos
    getEstadisticasReferidos: async () => {
        try {
            const response = await api.get('/estadisticas/referidos/');
            return response;
        } catch (error) {
            console.error('Error obteniendo estadísticas de referidos:', error);
            throw error;
        }
    },

    exportarReportePDF: async (periodo = 'mes', filters = {}) => {
        try {
            const params = { periodo, ...filters };
            const response = await api.get('/reportes/exportar/pdf/', {
                params,
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            console.error('Error exportando PDF:', error);
            throw error;
        }
    },

    exportarReporteExcel: async (periodo = 'mes', filters = {}) => {
        try {
            const params = { periodo, ...filters };
            const response = await api.get('/reportes/exportar/excel/', {
                params,
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            console.error('Error exportando Excel:', error);
            throw error;
        }
    }
};

// Update endpoints
tsjService.getVersion = async () => {
    const resp = await api.get('/update/version/');
    return resp.data;
};

tsjService.runUpdate = async (installerUrl, token) => {
    const headers = {};
    if (token) headers['X-UPDATE-TOKEN'] = token;
    const data = installerUrl ? { url: installerUrl } : {};
    const resp = await api.post('/update/run/', data, { headers });
    return resp.data;
};

// Auth helpers
tsjService.login = async (username, password) => {
    const resp = await api.post('/auth/login/', { username, password });
    // validate response
    if (!resp?.data?.token) throw new Error('Token no recibido del servidor');
    const payload = { token: resp.data.token, name: resp.data.username, id: resp.data.id };
    localStorage.setItem('currentUser', JSON.stringify(payload));
    localStorage.setItem('authToken', resp.data.token);
    return payload;
};

tsjService.logout = async () => {
    try {
        await api.post('/auth/logout/');
    } catch (e) {
        // ignore
    }
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
};

tsjService.getCurrentUser = async () => {
    try {
        const resp = await api.get('/auth/current/');
        return resp.data;
    } catch (e) {
        return null;
    }
};

tsjService.register = async (username, password, full_name = '') => {
    const resp = await api.post('/auth/register/', { username, password, full_name });
    if (!resp?.data?.token) throw new Error('Token no recibido del servidor');
    const payload = { token: resp.data.token, name: resp.data.username, id: resp.data.id };
    localStorage.setItem('currentUser', JSON.stringify(payload));
    localStorage.setItem('authToken', resp.data.token);
    return payload;
};

// Función de utilidad para manejar la descarga de archivos
export const descargarArchivo = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// Función de utilidad para formatear fechas
export const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};