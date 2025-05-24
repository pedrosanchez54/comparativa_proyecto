import React, { createContext, useContext, useState } from 'react';
import apiClient from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado de ejemplo: usuario autenticado y datos
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Funciones de ejemplo para login/logout
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Función para registrar un usuario
  const register = async (nombre, email, password) => {
    try {
      await apiClient.post('/auth/register', { nombre, email, password });
      toast.success('Registro exitoso. Ahora puedes iniciar sesión.');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Error en el registro.';
      toast.error(msg);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 