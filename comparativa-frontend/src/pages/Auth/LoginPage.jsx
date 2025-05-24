import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { FaSignInAlt } from 'react-icons/fa';
import './AuthForm.css'; // Importa estilos comunes

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Error específico del formulario
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Función login del contexto
  const navigate = useNavigate();
  const location = useLocation();

  // Determina a dónde redirigir después del login exitoso
  // Si el usuario fue redirigido aquí desde una ruta protegida, 'from' estará en el state.
  const from = location.state?.from?.pathname || '/'; // Por defecto, ir a la home

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir envío de formulario HTML
    setError(''); // Limpiar errores anteriores
    setLoading(true); // Indicar inicio de carga

    const success = await login(email, password); // Llama a la función login del contexto

    setLoading(false); // Indicar fin de carga
    if (success) {
      // Si el login fue exitoso (manejado en AuthContext), navegar a la página destino
      navigate(from, { replace: true }); // 'replace: true' evita que esta página quede en el historial
    } else {
      // Si falló, AuthContext ya mostró un toast. Podemos añadir un error local si queremos.
      setError('Email o contraseña incorrectos. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form card">
        <h2 className="auth-title"><FaSignInAlt /> Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          {/* Muestra el error local si existe */}
          {error && <ErrorMessage message={error} />}
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required // Campo obligatorio HTML5
              autoComplete="email"
              disabled={loading} // Deshabilitar mientras carga
              placeholder="tu@email.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              placeholder="Tu contraseña"
            />
          </div>
          <button type="submit" className="btn btn-primary auth-button" disabled={loading}>
            {loading ? 'Iniciando...' : 'Entrar'}
          </button>
        </form>
        <div className="auth-links">
          {/* Enlace para recuperar contraseña */}
          <Link to="/request-password-reset">¿Olvidaste tu contraseña?</Link>
          <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 