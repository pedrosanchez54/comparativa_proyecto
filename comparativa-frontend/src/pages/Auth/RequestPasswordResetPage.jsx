import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import './AuthForm.css';

const RequestPasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Por favor, ingresa tu email');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/auth/request-password-reset', { email });
      setSuccess(true);
      toast.success('Se ha enviado un enlace a tu email para restablecer tu contraseña');
    } catch (error) {
      toast.error('Error al solicitar el restablecimiento de contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/login" className="back-link">
          <FaArrowLeft /> Volver al inicio de sesión
        </Link>

        <h1>Restablecer Contraseña</h1>
        <p className="auth-description">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {success ? (
          <div className="success-message">
            <h2>¡Revisa tu email!</h2>
            <p>
              Hemos enviado un enlace a <strong>{email}</strong> con las instrucciones para restablecer tu contraseña.
            </p>
            <p>
              Si no lo encuentras, revisa tu carpeta de spam.
            </p>
            <Link to="/login" className="auth-link">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Enlace'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestPasswordResetPage; 