import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // useParams para leer el token de la URL
import apiClient from '../../services/api';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { toast } from 'react-toastify';
import { FaKey } from 'react-icons/fa';
import './AuthForm.css'; // Estilos comunes

const ResetPasswordPage = () => {
    const [nuevaContraseña, setNuevaContraseña] = useState('');
    const [confirmContraseña, setConfirmContraseña] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useParams(); // Obtiene el :token de la ruta definida en App.js
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones básicas del frontend
        if (!token) {
            setError('Falta el token de restablecimiento. Asegúrate de usar el enlace del email.');
            return;
        }
        if (nuevaContraseña.length < 8) {
             setError('La nueva contraseña debe tener al menos 8 caracteres.');
             return;
        }
        if (nuevaContraseña !== confirmContraseña) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        try {
            // Llama al endpoint del backend pasando el token en la URL y la nueva contraseña en el body
            await apiClient.post(`/auth/reset-password/${token}`, { nuevaContraseña });
            toast.success('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión con tu nueva contraseña.');
            navigate('/login'); // Redirigir a la página de login
        } catch (err) {
             // Capturar errores de la API (token inválido, expirado, etc.)
             const errorMessage = err.response?.data?.message || 'Error al restablecer la contraseña. El token puede ser inválido o haber expirado.';
             setError(errorMessage);
             toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
         <div className="auth-container">
          <div className="auth-form card">
            <h2 className="auth-title"><FaKey /> Establecer Nueva Contraseña</h2>
            <form onSubmit={handleSubmit}>
               {error && <ErrorMessage message={error} />}
              <div className="form-group">
                <label htmlFor="nuevaContraseña">Nueva Contraseña (mín. 8 caracteres)</label>
                <input
                  type="password"
                  id="nuevaContraseña"
                  value={nuevaContraseña}
                  onChange={(e) => setNuevaContraseña(e.target.value)}
                  required
                  minLength="8"
                  autoComplete="new-password"
                  disabled={loading}
                  placeholder="Introduce tu nueva contraseña"
                />
              </div>
               <div className="form-group">
                <label htmlFor="confirmContraseña">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  id="confirmContraseña"
                  value={confirmContraseña}
                  onChange={(e) => setConfirmContraseña(e.target.value)}
                  required
                  minLength="8"
                  autoComplete="new-password"
                  disabled={loading}
                  placeholder="Repite la nueva contraseña"
                />
              </div>
              <button type="submit" className="btn btn-primary auth-button" disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </form>
             <div className="auth-links">
               <Link to="/login">Volver a Iniciar Sesión</Link>
             </div>
          </div>
        </div>
    );
};

export default ResetPasswordPage; 