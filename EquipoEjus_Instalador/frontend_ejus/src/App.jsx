import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import './App.css';

// Importar páginas
import Dashboard from './pages/DashBoards';
import Registrar from './pages/Registrar';
import Reportes from './pages/Reportes';
import Auditoria from './pages/Auditoria';

// Importar componentes
import Navbar from './components/Navbar';
import UpdateButton from './components/UpdateButton';
import LoginModal from './components/Modals/ModalLogin';
import RegisterModal from './components/Modals/ModalRegister';
import ConfirmModal from './components/Modals/ConfirmModal';
import { tsjService } from './services/api';

const initialState = {
  loading: false,
  activeTab: 'dashboard',
  refreshKey: 0,
  currentUser: null,
  loginOpen: false,
  registerOpen: false,
  logoutConfirmOpen: false
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'REFRESH_DATA':
      return { ...state, refreshKey: state.refreshKey + 1 };
    case 'SET_USER':
      return { ...state, currentUser: action.payload, loginOpen: false, registerOpen: false };
    case 'SET_LOGIN_OPEN':
      return { ...state, loginOpen: action.payload };
    case 'SET_REGISTER_OPEN':
      return { ...state, registerOpen: action.payload };
    case 'SET_LOGOUT_CONFIRM_OPEN':
      return { ...state, logoutConfirmOpen: action.payload };
    case 'TOGGLE_MODALS':
      return { ...state, loginOpen: action.login, registerOpen: action.register };
    case 'LOGOUT':
      return { ...state, currentUser: null, loginOpen: true, logoutConfirmOpen: false };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = React.useReducer(appReducer, initialState);
  const { loading, activeTab, refreshKey, currentUser, loginOpen, registerOpen, logoutConfirmOpen } = state;

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const stored = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (stored && stored.token) {
          dispatch({ type: 'SET_USER', payload: stored });
        } else {
          dispatch({ type: 'SET_LOGIN_OPEN', payload: true });
        }
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    cargarDatosIniciales();
  }, []);

  // Función para refrescar datos cuando se crea/edita/elimina un visitante
  const handleNuevoVisitanteSuccess = () => {
    dispatch({ type: 'REFRESH_DATA' });
  };

  // Función para cambiar de tab y resetear el estado
  const handleTabChange = (tab) => {
    dispatch({ type: 'SET_TAB', payload: tab });
  };

  // Función para logout
  const handleLogout = () => {
    dispatch({ type: 'SET_LOGOUT_CONFIRM_OPEN', payload: true });
  };

  const handleConfirmLogout = () => {
    tsjService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Inicializando sistema...</p>
        </div>
      </div>
    );
  }
  if (!currentUser) {
    return (
      <div className="app-container">
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onLogout={handleLogout}
          onNuevoVisitanteSuccess={handleNuevoVisitanteSuccess}
          currentUser={currentUser}
          onOpenLogin={() => dispatch({ type: 'SET_LOGIN_OPEN', payload: true })}
        />

        <LoginModal
          isOpen={loginOpen}
          onClose={() => dispatch({ type: 'SET_LOGIN_OPEN', payload: false })}
          onOpenRegister={() => dispatch({ type: 'TOGGLE_MODALS', login: false, register: true })}
          onSuccess={(user) => dispatch({ type: 'SET_USER', payload: user })}
        />

        <RegisterModal
          isOpen={registerOpen}
          onClose={() => dispatch({ type: 'SET_REGISTER_OPEN', payload: false })}
          onOpenLogin={() => dispatch({ type: 'TOGGLE_MODALS', login: true, register: false })}
          onSuccess={(user) => dispatch({ type: 'SET_USER', payload: user })}
        />
        <ConfirmModal
          isOpen={logoutConfirmOpen}
          title="Cerrar sesión"
          message="¿Está seguro de cerrar sesión?"
          onConfirm={handleConfirmLogout}
          onCancel={() => dispatch({ type: 'SET_LOGOUT_CONFIRM_OPEN', payload: false })}
          confirmLabel="Cerrar sesión"
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
        onNuevoVisitanteSuccess={handleNuevoVisitanteSuccess}
        currentUser={currentUser}
        onOpenLogin={() => dispatch({ type: 'SET_LOGIN_OPEN', payload: true })}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => dispatch({ type: 'SET_LOGIN_OPEN', payload: false })}
        onOpenRegister={() => dispatch({ type: 'TOGGLE_MODALS', login: false, register: true })}
        onSuccess={(user) => dispatch({ type: 'SET_USER', payload: user })}
      />

      <RegisterModal
        isOpen={registerOpen}
        onClose={() => dispatch({ type: 'SET_REGISTER_OPEN', payload: false })}
        onOpenLogin={() => dispatch({ type: 'TOGGLE_MODALS', login: true, register: false })}
        onSuccess={(user) => dispatch({ type: 'SET_USER', payload: user })}
      />
      <ConfirmModal
        isOpen={logoutConfirmOpen}
        title="Cerrar sesión"
        message="¿Está seguro de cerrar sesión?"
        onConfirm={handleConfirmLogout}
        onCancel={() => dispatch({ type: 'SET_LOGOUT_CONFIRM_OPEN', payload: false })}
        confirmLabel="Cerrar sesión"
      />
      {/* Contenido Principal */}
      <main className="main-content">
        <div className="content-header">
          <h2>
            {activeTab === 'dashboard' && 'Dashboard de Control de Visitantes'}
            {activeTab === 'registros' && 'Registro de Visitantes'}
            {activeTab === 'reportes' && 'Reportes y Estadísticas'}
            {activeTab === 'auditoria' && 'Auditoría del Sistema'}
          </h2>
          <div className="breadcrumb">
            <span>TSJ</span>
            <span>›</span>
            <span>Control de Acceso</span>
            <span>›</span>
            <span className="active">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'registros' && 'Registros'}
              {activeTab === 'reportes' && 'Reportes'}
              {activeTab === 'auditoria' && 'Auditoría'}
            </span>
          </div>
        </div>

        <div className="content-body">
          {/* Usamos key para forzar el refresco de componentes cuando cambian los datos */}
          {activeTab === 'dashboard' && <Dashboard key={`dashboard-${refreshKey}`} setActiveTab={handleTabChange} />}
          {activeTab === 'registros' && <Registrar key={`registrar-${refreshKey}`} />}
          {activeTab === 'reportes' && <Reportes key={`reportes-${refreshKey}`} />}
          {activeTab === 'auditoria' && currentUser?.username === 'admin' && <Auditoria key={`auditoria-${refreshKey}`} />}
        </div>
      </main>

      {/* Footer Institucional */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span>Direccion Ejecutiva de la Magistratura</span>
            <span className="divider">|</span>
            <span>Sistema de Control de Visitantes v1.0.5</span>
          </div>
          <div className="footer-right" style={{ gap: '1.2rem' }}>
            <span>{new Date().getFullYear()} © TSJ - Eleborado por: TSU. Luis Rodriguez</span>
            <span className="divider">|</span>
            <UpdateButton />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;