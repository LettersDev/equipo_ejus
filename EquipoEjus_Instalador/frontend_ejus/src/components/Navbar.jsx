import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, UserPlus, Shield, LogOut, LogIn, CloudUpload } from 'lucide-react';
import ModalNuevoVisitante from './Modals/ModalNuevoVisitante'
import LoginModal from './Modals/ModalLogin'
import { tsjService } from '../services/api'
// import UpdateButton from './UpdateButton'

const Navbar = ({ 
  activeTab, 
  setActiveTab,
  onLogout,
  onNuevoVisitanteSuccess,
  currentUser,
  onOpenLogin,
  onCloseLogin
}) => {
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const updateToken = (() => {
    try{ const u = JSON.parse(localStorage.getItem('currentUser')||'null'); return u?.update_token || null }catch(e){return null}
  })();

  const handleNuevoVisitante = () => {
    // if a login modal is open, request it to close so the new-visitor modal is visible
    onCloseLogin?.();
    console.debug('[Navbar] Opening Nuevo Visitante modal');
    setModalNuevoOpen(true);
  };

  const handleNuevoVisitanteSuccess = () => {
    setModalNuevoOpen(false);
    onNuevoVisitanteSuccess?.();
  };

  return (
    <>
      <header className="app-header">
        <div className="header-top">
          <div className="institution-info">
            <div className="logo-container">
              
              <div>
                <h1>TRIBUNAL SUPREMO DE JUSTICIA</h1>
                <p className="institution-subtitle">Equipo de Justicia Social</p>
              </div>
            </div>
            <div className="header-actions">
              <div className="user-profile">
                <div className="profile-avatar">TSJ</div>
                <div className="profile-info">
                  <span className="profile-name">{currentUser?.name || 'Administrador TSJ'}</span>
                  <span className="profile-role">Control de Visitantes</span>
                </div>
                {currentUser ? (
                  <button 
                    className="btn-logout"
                    onClick={async () => { await tsjService.logout(); onLogout?.(); }}
                    title="Cerrar sesión"
                  >
                    <LogOut size={18} />
                  </button>
                ) : (
                  <button className="btn-login" onClick={onOpenLogin} title="Iniciar sesión">
                    <LogIn size={18} />
                  </button>
                )}
              </div>
              {/* Botón de actualización movido al footer */}
              </div>
            </div>
          </div>
        

        <nav className="main-nav">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              title="Ver estadísticas y dashboard"
            >
              <BarChart3 size={18} />
              Dashboard
            </button>
            <button 
              className={`nav-tab ${activeTab === 'registros' ? 'active' : ''}`}
              onClick={() => setActiveTab('registros')}
              title="Ver todos los registros de visitantes"
            >
              <Users size={18} />
              Registros
            </button>
            <button 
              className={`nav-tab ${activeTab === 'reportes' ? 'active' : ''}`}
              onClick={() => setActiveTab('reportes')}
              title="Ver reportes y estadísticas avanzadas"
            >
              <FileText size={18} />
              Reportes
            </button>
          </div>
          <button 
            className="btn-primary"
            onClick={handleNuevoVisitante}
            title="Registrar un nuevo visitante"
          >
            <UserPlus size={18} />
            Nuevo Visitante
          </button>
        </nav>
      </header>

      {/* Modal para nuevo visitante */}
      <ModalNuevoVisitante
        isOpen={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        onSuccess={handleNuevoVisitanteSuccess}
      />
    </>
  );
};

export default Navbar;