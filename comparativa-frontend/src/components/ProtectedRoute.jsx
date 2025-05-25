import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './Common/LoadingSpinner';

/**
 * Componente para proteger rutas privadas.
 * @param {object} props - Propiedades del componente.
 * @param {ReactNode} props.children - El contenido de la ruta protegida.
 * @param {boolean} props.adminOnly - Si es true, solo permite acceso a admin.
 * @param {string[]} props.allowedRoles - Array de roles permitidos para acceder a la ruta.
 * @param {string} props.redirectTo - Ruta a la que redirigir si no tiene acceso (por defecto '/').
 */
const ProtectedRoute = ({ 
  children, 
  adminOnly = false,
  allowedRoles = [],
  redirectTo = '/'
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner message="Verificando acceso..." />;
  }

  // Si no está autenticado, redirige a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar rol de administrador
  if (adminOnly && user?.rol !== 'admin') {
    return <Navigate to={redirectTo} replace />;
  }

  // Verificar roles permitidos si se especifican
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si pasa todas las comprobaciones, renderiza el contenido
  return children;
};

export default ProtectedRoute; 