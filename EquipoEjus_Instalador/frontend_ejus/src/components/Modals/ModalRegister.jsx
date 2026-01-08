import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { tsjService } from '../../services/api';
import tsjLogo from '../../assets/tsj.png';

const ModalRegister = ({ isOpen = false, onClose, onSuccess, onOpenLogin }) => {
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
      const user = await tsjService.register(username.trim(), password);
      onSuccess?.(user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar usuario');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card" role="dialog" aria-modal="true" aria-labelledby="register-title">
        {/* Columna izquierda con imagen (puede ser diferente para registro) */}
        <div
          className="auth-image-section auth-image-register"
          style={{ backgroundImage: `url(${tsjLogo})` }}
          aria-hidden="true"
        >
          <div className="auth-image-overlay" />
        </div>

        {/* Columna derecha con formulario */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <h2 id="register-title">Crear Cuenta</h2>
            
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
                  placeholder="Contraseña"
                  required
                />
              </div>
              
              {error && <div className="form-error">{error}</div>}
              
              <button type="submit" className="btn-auth btn-primary" disabled={loading}>
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </button>
              
              <div className="auth-link">
                <span>¿Ya tienes una cuenta? </span>
                <button type="button" className="text-link" onClick={onOpenLogin}>Inicia sesión</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

ModalRegister.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
  onOpenLogin: PropTypes.func,
};

export default ModalRegister;