import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import BackButton from '../../components/Common/BackButton';
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
        <BackButton goBack="/login" text="Volver al inicio de sesión" />
        
        <div className="auth-form">
          <h2 className="auth-title"><FaEnvelope /> Restablecer Contraseña</h2>
          <p className="auth-description">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {success ? (
            <div className="success-message">
              <h3>¡Revisa tu email!</h3>
              <p>
                Hemos enviado un enlace a <strong>{email}</strong> con las instrucciones para restablecer tu contraseña.
              </p>
              <p>
                Si no lo encuentras, revisa tu carpeta de spam.
              </p>
              <div className="auth-links">
                <Link to="/login">Volver al inicio de sesión</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
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

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Enviando...' : 'ENVIAR ENLACE'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
    );
};

export default RequestPasswordResetPage; 