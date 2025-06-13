import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';
import { toast } from 'react-toastify';
import sha256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';

const AuthContext = createContext();

// Clave para almacenar el token en localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Función utilitaria para pre-hashear la contraseña
function preHashPassword(password) {
  return sha256(password).toString(Hex);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar el estado de autenticación al iniciar
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    
    if (token && savedUser) {
      const userData = JSON.parse(savedUser);
    setUser(userData);
    setIsAuthenticated(true);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  // Función para registrar un usuario
  const register = async (nombre, email, password) => {
    try {
      const preHashed = preHashPassword(password);
      await apiClient.post('/auth/register', { 
        nombre, 
        email, 
        contraseña: preHashed,
        is_pre_hashed: true
      });
      toast.success('Registro completado con éxito. Ahora puedes iniciar sesión.');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Error en el registro.';
      toast.error(msg);
      return false;
    }
  };

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const preHashed = preHashPassword(password);
      const response = await apiClient.post('/auth/login', { 
        email, 
        contraseña: preHashed,
        is_pre_hashed: true
      });
      const { token, user: userData } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('¡Bienvenido de nuevo!');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al iniciar sesión.';
      toast.error(msg);
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Limpiar headers de API
    delete apiClient.defaults.headers.common['Authorization'];
    
    // Resetear estado
    setUser(null);
    setIsAuthenticated(false);
    
    toast.info('Has cerrado sesión.');
  };

  // Función para actualizar datos del usuario localmente
  const setUserData = (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  // Función para actualizar datos del usuario
  const updateUserData = async (userData) => {
    try {
      const response = await apiClient.put('/users/profile', userData);
      const updatedUser = response.data;
      
      // Actualizar localStorage y estado
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Perfil actualizado correctamente.');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al actualizar el perfil.';
      toast.error(msg);
      return false;
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const preHashedCurrent = preHashPassword(currentPassword);
      const preHashedNew = preHashPassword(newPassword);
      await apiClient.put('/users/password', { 
        currentPassword: preHashedCurrent, 
        newPassword: preHashedNew,
        is_pre_hashed: true
      });
      toast.success('Contraseña actualizada correctamente.');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al cambiar la contraseña.';
      toast.error(msg);
      return false;
    }
  };

  // Función para solicitar reseteo de contraseña
  const requestPasswordReset = async (email) => {
    try {
      await apiClient.post('/auth/request-reset', { email });
      toast.success('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al solicitar el restablecimiento de contraseña.';
      toast.error(msg);
      return false;
    }
  };

  // Función para resetear contraseña
  const resetPassword = async (token, newPassword) => {
    try {
      const preHashedNew = preHashPassword(newPassword);
      await apiClient.post('/auth/reset-password', { 
        token, 
        newPassword: preHashedNew,
        is_pre_hashed: true
      });
      toast.success('Contraseña restablecida con éxito. Ya puedes iniciar sesión.');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al restablecer la contraseña.';
      toast.error(msg);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      register,
      login,
      logout,
      setUserData,
      updateUserData,
      changePassword,
      requestPasswordReset,
      resetPassword
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 