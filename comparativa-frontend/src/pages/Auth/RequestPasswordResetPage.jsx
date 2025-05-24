import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api'; // Usamos apiClient directamente
import ErrorMessage from '../../components/Common/ErrorMessage';
import { toast } from 'react-toastify'; // Para notificaciones
import { FaEnvelope } from 'react-icons/fa';
import './AuthForm.css'; // Estilos comunes

const RequestPasswordResetPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(''); // Errores específicos de esta acción
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(''); // Mensaje informativo/éxito

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage(''); // Limpiar mensajes previos
        setLoading(true);

        try {
            // Llama directamente al endpoint del backend
            const response = await apiClient.post('/auth/request-password-reset', { email });
            // Muestra el mensaje devuelto por el backend (sea éxito o indicación genérica)
            setMessage(response.data.message);
            toast.info(response.data.message); // Usar toast.info para este tipo de mensaje
            setEmail(''); // Limpiar el campo de email tras el envío exitoso
        } catch (err) {
            // Captura errores de la llamada API
            const errorMessage = err.response?.data?.message || 'Error al solicitar el restablecimiento de contraseña.';
            setError(errorMessage);
            toast.error(errorMessage); // Mostrar error con toast
        } finally {
            setLoading(false); // Finalizar estado de carga
        }
    };

    return (
       <div className="auth-container">
          <div className="auth-form card">
            <h2 className="auth-title"><FaEnvelope /> Recuperar Contraseña</h2>
             <p className='auth-instructions'>
                Introduce tu dirección de correo electrónico. Si está registrada, te enviaremos
                un enlace para que puedas restablecer tu contraseña.
             </p>
            <form onSubmit={handleSubmit}>
              {/* Muestra error local si existe */}
              {error && <ErrorMessage message={error} />}
              {/* Muestra mensaje informativo si existe */}
              {message && <div className="alert alert-info" role="status">{message}</div>}
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={loading}
                  placeholder="El email asociado a tu cuenta"
                />
              </div>
              <button type="submit" className="btn btn-primary auth-button" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              </button>
            </form>
            <div className="auth-links">
              <Link to="/login">Volver a Iniciar Sesión</Link>
            </div>
          </div>
        </div>
    );
};

// Estilo simple para la alerta informativa (si no tienes uno global)
const alertStyle = `
    .alert { padding: 10px 15px; margin-bottom: 15px; border-radius: 4px; border: 1px solid transparent; }
    .alert-info { color: #0c5460; background-color: #d1ecf1; border-color: #bee5eb; }
`;
// Inyectar estilos si no existen ya (una forma simple, podría hacerse mejor)
if (!document.getElementById('alert-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'alert-styles';
    styleSheet.innerText = alertStyle;
    document.head.appendChild(styleSheet);
}

export default RequestPasswordResetPage; 