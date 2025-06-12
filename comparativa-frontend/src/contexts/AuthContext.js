import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js'; // Asegúrate de que esta dependencia esté instalada

const AuthContext = createContext();

// Clave para almacenar el token en localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
// Salt estático para pre-hash client-side - esto solo añade una capa de ofuscación
// La verdadera seguridad sigue dependiendo del hash en el servidor
const CLIENT_SALT = 'comparativa_vehicles_client_salt';

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

  // Función de pre-hash para contraseñas (añade una capa de protección en tránsito)
  const preHashPassword = (password) => {
    // Este no es un hash de seguridad completo, solo una protección durante la transmisión
    // El backend sigue siendo responsable del hash seguro definitivo
    return CryptoJS.SHA256(password + CLIENT_SALT).toString();
  };

  // Función para registrar un usuario
  const register = async (nombre, email, password) => {
    try {
      // Pre-hash de la contraseña antes de enviarla
      const hashedPassword = preHashPassword(password);
      
      await apiClient.post('/auth/register', { 
        nombre, 
        email, 
        contraseña: hashedPassword,
        is_pre_hashed: true // Indicador para que el backend sepa que ya está pre-hasheada
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
      // Pre-hash de la contraseña antes de enviarla
      const hashedPassword = preHashPassword(password);
      
      const response = await apiClient.post('/auth/login', { 
        email, 
        contraseña: hashedPassword,
        is_pre_hashed: true // Indicador para que el backend sepa que ya está pre-hasheada
      });
      
      const { token, user: userData } = response.data;
      
      // Guardar token y datos de usuario
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      // Configurar el cliente API con el token
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Actualizar estado
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
      // Pre-hash de las contraseñas antes de enviarlas
      const hashedCurrentPassword = preHashPassword(currentPassword);
      const hashedNewPassword = preHashPassword(newPassword);
      
      await apiClient.put('/users/password', { 
        currentPassword: hashedCurrentPassword, 
        newPassword: hashedNewPassword,
        is_pre_hashed: true // Indicador para el backend
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
      // Pre-hash de la nueva contraseña
      const hashedNewPassword = preHashPassword(newPassword);
      
      await apiClient.post('/auth/reset-password', { 
        token, 
        newPassword: hashedNewPassword,
        is_pre_hashed: true // Indicador para el backend
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