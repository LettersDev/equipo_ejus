import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { tsjService } from '../../services/api';
import tsjLogo from '../../assets/tsj.png';

const ModalLogin = ({ isOpen = true, onClose, onSuccess, onOpenRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Accept username for backend
      const user = await tsjService.login(username.trim(), password);
      onSuccess?.(user);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      if (err.response?.status === 400) {
        setError(detail || 'Usuario o contraseña incorrectos');
      } else {
        setError('No se pudo conectar con el servidor. Intenta nuevamente.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card" role="dialog" aria-modal="true" aria-labelledby="login-title">
        {/* Columna izquierda con imagen */}
        <div
          className="auth-image-section"
          style={{ backgroundImage: `url(${tsjLogo})` }}
          aria-hidden="true"
        >
          <div className="auth-image-overlay" />
        </div>

        {/* Columna derecha con formulario */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <h2 id="login-title">Iniciar Sesión</h2>
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Usuario</label>
                <input 
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="usuario"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                />
              </div>
              
              {/* removed remember-me by request */}
              
              {error && <div className="form-error">{error}</div>}
              
              <button type="submit" className="btn-auth btn-primary" disabled={loading}>
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
              
              <div className="auth-link">
                <span>¿No tienes una cuenta? </span>
                <button type="button" className="text-link" onClick={onOpenRegister}>Crea una ahora</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

ModalLogin.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
  onOpenRegister: PropTypes.func,
};

export default ModalLogin;