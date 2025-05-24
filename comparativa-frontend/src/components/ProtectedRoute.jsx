import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para proteger rutas privadas.
 * @param {ReactNode} children - El contenido de la ruta protegida.
 * @param {boolean} adminOnly - Si es true, solo permite acceso a admin.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Si no está autenticado, redirige a login y guarda la ruta de origen
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.rol !== 'admin') {
    // Si la ruta es solo para admin y el usuario no es admin, redirige a home
    return <Navigate to="/" replace />;
  }

  // Si pasa las comprobaciones, renderiza el contenido
  return children;
};

export default ProtectedRoute; 