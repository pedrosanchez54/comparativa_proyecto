import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaKey, FaArrowLeft } from 'react-icons/fa';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import './AuthForm.css';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      await apiClient.get(`/auth/validate-reset-token/${token}`);
      setValidToken(true);
    } catch (error) {
      toast.error('El enlace de restablecimiento no es válido o ha expirado');
      navigate('/request-password-reset');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Por favor, completa todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post(`/auth/reset-password/${token}`, { password });
      toast.success('Contraseña restablecida correctamente');
      navigate('/login');
    } catch (error) {
      toast.error('Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="loading-message">
            <p>Verificando enlace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="error-message">
            <h2>Enlace no válido</h2>
            <p>El enlace de restablecimiento no es válido o ha expirado.</p>
            <Link to="/request-password-reset" className="auth-link">
              Solicitar un nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/login" className="back-link">
          <FaArrowLeft /> Volver al inicio de sesión
        </Link>

        <h1>Restablecer Contraseña</h1>
        <p className="auth-description">
          Ingresa tu nueva contraseña.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Nueva Contraseña</label>
            <div className="input-group">
              <FaKey className="input-icon" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
                disabled={loading}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="input-group">
              <FaKey className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu nueva contraseña"
                disabled={loading}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 