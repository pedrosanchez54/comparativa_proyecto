import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaKey } from 'react-icons/fa';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import BackButton from '../../components/Common/BackButton';
import './AuthForm.css';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateToken = useCallback(async () => {
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
  }, [token, navigate]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

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
      await apiClient.post(`/auth/reset-password/${token}`, { nuevaContraseña: password });
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
          <div className="auth-form">
            <div className="loading-message">
              <p>Verificando enlace...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-form">
            <div className="error-message">
              <h3>Enlace no válido</h3>
              <p>El enlace de restablecimiento no es válido o ha expirado.</p>
              <div className="auth-links">
                <Link to="/request-password-reset">Solicitar un nuevo enlace</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <BackButton goBack="/login" text="Volver al inicio de sesión" />
        
        <div className="auth-form">
          <h2 className="auth-title"><FaKey /> Restablecer Contraseña</h2>
          <p className="auth-description">
            Ingresa tu nueva contraseña.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
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

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Restableciendo...' : 'RESTABLECER CONTRASEÑA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 