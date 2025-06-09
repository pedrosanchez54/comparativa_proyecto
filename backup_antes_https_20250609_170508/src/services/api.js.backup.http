import axios from 'axios';
import { toast } from 'react-toastify';

// Configura aquí la URL base de la API según el entorno:
// - En local: 'http://localhost:4000/api'
// - En red local: 'http://192.168.1.82:4000/api'
// - Desde fuera (DDNS): 'http://TU_DDNS_AQUI:4000/api'
// Puedes usar un archivo .env para cambiarlo fácilmente sin tocar el código.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Crea una instancia de Axios preconfigurada
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de petición para añadir el token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores comunes
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401: // No autorizado
          // Limpiar token y datos de usuario si están expirados
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          
          // Redirigir al login si no estamos ya en la página de login
          if (!window.location.pathname.includes('/login')) {
            toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
            window.location.href = '/login';
          }
          break;

        case 403: // Prohibido
          toast.error('No tienes permiso para realizar esta acción.');
          break;

        case 404: // No encontrado
          toast.error('El recurso solicitado no existe.');
          break;

        case 422: // Error de validación
          if (data.errors) {
            Object.values(data.errors).forEach(error => {
              toast.error(error);
            });
          } else {
            toast.error(data.message || 'Error de validación.');
          }
          break;

        case 429: // Demasiadas peticiones
          toast.error('Has realizado demasiadas peticiones. Por favor, espera un momento.');
          break;

        default:
          if (status >= 500) {
            toast.error('Ha ocurrido un error en el servidor. Por favor, inténtalo más tarde.');
          } else {
            toast.error(data.message || 'Ha ocurrido un error inesperado.');
          }
          break;
      }
    } else if (error.request) {
      toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      toast.error('Ha ocurrido un error al procesar tu solicitud.');
    }

    return Promise.reject(error);
  }
);

// Exporta la instancia configurada para usarla en otros archivos
export default apiClient; 