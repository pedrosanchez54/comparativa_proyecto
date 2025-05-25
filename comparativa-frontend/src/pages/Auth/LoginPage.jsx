import React, { useState, useEffect } from 'react';
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
  const { login, isAuthenticated } = useAuth(); // Función login del contexto
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Determina a dónde redirigir después del login exitoso
  // Si el usuario fue redirigido aquí desde una ruta protegida, 'from' estará en el state.
  const from = location.state?.from?.pathname || '/'; // Por defecto, ir a la home

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir envío de formulario HTML
    setError(''); // Limpiar errores anteriores
    setLoading(true); // Indicar inicio de carga

    try {
      const success = await login(email, password);
      if (success) {
        // Si el login fue exitoso (manejado en AuthContext), navegar a la página destino
        navigate(from, { replace: true }); // 'replace: true' evita que esta página quede en el historial
      } else {
        // Si falló, AuthContext ya mostró un toast. Podemos añadir un error local si queremos.
        setError('Email o contraseña incorrectos. Inténtalo de nuevo.');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false); // Indicar fin de carga
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
              className="form-control"
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
              className="form-control"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary auth-button" 
            disabled={loading || !email || !password}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        <div className="auth-links">
          {/* Enlace para recuperar contraseña */}
          <Link to="/request-password-reset" className="forgot-password-link">
            ¿Olvidaste tu contraseña?
          </Link>
          <p>¿No tienes cuenta? <Link to="/register" className="register-link">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 