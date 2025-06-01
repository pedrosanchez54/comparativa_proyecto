import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { FaUserPlus } from 'react-icons/fa';
import './AuthForm.css'; // Estilos comunes

const RegisterPage = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); // Errores de validación del frontend
  const [loading, setLoading] = useState(false);
  const { register } = useAuth(); // Función register del contexto
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos

    // Validaciones básicas del frontend
    if (!nombre.trim()) {
        setError('El nombre es requerido.');
        return;
    }
    if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    // Llama a la función register del contexto (que llama a la API)
    const success = await register(nombre, email, password);
    setLoading(false);

    if (success) {
      // Si el registro fue exitoso (manejado en AuthContext), redirigir al login
      navigate('/login');
    } else {
       // AuthContext ya mostró el error específico de la API (ej. email duplicado) con toast.
       // Podemos poner un error genérico local si es necesario, pero puede ser redundante.
       // setError('Fallo en el registro. Verifica tus datos o inténtalo más tarde.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form">
          <h2 className="auth-title"><FaUserPlus /> Crear Cuenta</h2>
          <form onSubmit={handleSubmit}>
            {error && <ErrorMessage message={error} />}
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoComplete="name"
                disabled={loading}
                placeholder="Tu nombre y apellidos"
              />
            </div>
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
                placeholder="tu@email.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña (mín. 8 caracteres)</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="8"
                autoComplete="new-password"
                disabled={loading}
                placeholder="Crea una contraseña segura"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="8"
                autoComplete="new-password"
                disabled={loading}
                placeholder="Repite la contraseña"
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Registrando...' : 'REGISTRARSE'}
            </button>
          </form>
          <div className="auth-links">
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 