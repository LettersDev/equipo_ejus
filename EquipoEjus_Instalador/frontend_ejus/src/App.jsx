import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import './App.css';

// Importar páginas
import Dashboard from './pages/DashBoards';
import Registrar from './pages/Registrar';
import Reportes from './pages/Reportes';

// Importar componentes
import Navbar from './components/Navbar';
import UpdateButton from './components/UpdateButton';
import LoginModal from './components/Modals/ModalLogin';
import RegisterModal from './components/Modals/ModalRegister';
import ConfirmModal from './components/Modals/ConfirmModal';
import { tsjService } from './services/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Cargar datos iniciales (opcional - para estadísticas globales si las necesitas)
  useEffect(() => {
    // Si necesitas cargar datos globales al iniciar la app
    const cargarDatosIniciales = async () => {
      setLoading(true);
      try {
        // Aquí puedes cargar datos iniciales si es necesario
        // revisar si hay usuario en localStorage
        const stored = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (stored && stored.token) {
          setCurrentUser(stored);
        } else {
          setLoginOpen(true);
        }
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // Función para refrescar datos cuando se crea/edita/elimina un visitante
  const handleNuevoVisitanteSuccess = () => {
    setRefreshKey(prev => prev + 1); // Forzar refresco de datos en todas las páginas
  };

  // Función para cambiar de tab y resetear el estado
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Función para logout (si implementas autenticación)
  const handleLogout = () => {
    // open confirm modal instead of window.confirm
    setLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    tsjService.logout();
    setCurrentUser(null);
    setLoginOpen(true);
    setLogoutConfirmOpen(false);
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
          onOpenLogin={() => setLoginOpen(true)}
        />

        <LoginModal
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
          onOpenRegister={() => { setLoginOpen(false); setRegisterOpen(true); }}
          onSuccess={(user) => { setCurrentUser(user); setLoginOpen(false); }}
        />

        <RegisterModal
          isOpen={registerOpen}
          onClose={() => setRegisterOpen(false)}
          onOpenLogin={() => { setRegisterOpen(false); setLoginOpen(true); }}
          onSuccess={(user) => { setCurrentUser(user); setRegisterOpen(false); }}
        />
        <ConfirmModal
          isOpen={logoutConfirmOpen}
          title="Cerrar sesión"
          message="¿Está seguro de cerrar sesión?"
          onConfirm={handleConfirmLogout}
          onCancel={() => setLogoutConfirmOpen(false)}
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
        onOpenLogin={() => setLoginOpen(true)}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onOpenRegister={() => { setLoginOpen(false); setRegisterOpen(true); }}
        onSuccess={(user) => { setCurrentUser(user); setLoginOpen(false); }}
      />

      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onOpenLogin={() => { setRegisterOpen(false); setLoginOpen(true); }}
        onSuccess={(user) => { setCurrentUser(user); setRegisterOpen(false); }}
      />
      <ConfirmModal
        isOpen={logoutConfirmOpen}
        title="Cerrar sesión"
        message="¿Está seguro de cerrar sesión?"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
        confirmLabel="Cerrar sesión"
      />
      {/* Contenido Principal */}
      <main className="main-content">
        <div className="content-header">
          <h2>
            {activeTab === 'dashboard' && 'Dashboard de Control de Visitantes'}
            {activeTab === 'registros' && 'Registro de Visitantes'}
            {activeTab === 'reportes' && 'Reportes y Estadísticas'}
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
            </span>
          </div>
        </div>

        <div className="content-body">
          {/* Usamos key para forzar el refresco de componentes cuando cambian los datos */}
          {activeTab === 'dashboard' && <Dashboard key={`dashboard-${refreshKey}`} setActiveTab={handleTabChange} />}
          {activeTab === 'registros' && <Registrar key={`registrar-${refreshKey}`} />}
          {activeTab === 'reportes' && <Reportes key={`reportes-${refreshKey}`} />}
        </div>
      </main>

      {/* Footer Institucional */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span>Direccion Ejecutiva de la Magistratura</span>
            <span className="divider">|</span>
            <span>Sistema de Control de Visitantes v1.0</span>
          </div>
          <div className="footer-right" style={{gap:'1.2rem'}}>
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