import axios from 'axios';

// Configura aquí la URL base de la API según el entorno:
// - En local: 'http://localhost:4000/api'
// - En red local: 'http://192.168.1.82:4000/api'
// - Desde fuera (DDNS): 'http://TU_DDNS_AQUI:4000/api'
// Puedes usar un archivo .env para cambiarlo fácilmente sin tocar el código.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Crea una instancia de Axios preconfigurada
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // ¡IMPORTANTE! Permite que Axios envíe y reciba cookies entre dominios/puertos diferentes.
  // Esencial para que la autenticación basada en sesiones funcione correctamente.
  withCredentials: true
});

<<<<<<< HEAD
// Interceptor de respuesta para manejar errores comunes globalmente
apiClient.interceptors.response.use(
  // Función para respuestas exitosas (status 2xx)
  (response) => {
=======
// --- Opcional: Interceptores ---
// Los interceptores permiten ejecutar código antes de que una petición se envíe
// o después de recibir una respuesta (o error).

// Ejemplo: Interceptor de respuesta para manejar errores comunes globalmente
/*
apiClient.interceptors.response.use(
  // Función para respuestas exitosas (status 2xx)
  (response) => {
    // Simplemente devuelve la respuesta si todo está bien
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
    return response;
  },
  // Función para manejar errores (status no 2xx)
  (error) => {
    // Loguear el error para depuración
<<<<<<< HEAD
    console.error('Error en la respuesta de la API:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
=======
    console.error('Error en la respuesta de la API:', error.config?.url, error.response?.status, error.response?.data);
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445

    if (error.response) {
      // El servidor respondió con un error
      const { status, data } = error.response;

      if (status === 401) {
<<<<<<< HEAD
        console.warn('Error 401: No autorizado.');
      } else if (status === 403) {
        console.warn('Error 403: Acceso prohibido.');
      } else if (status >= 500) {
        console.error('Error interno del servidor:', status, data);
      }

    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta
      console.error('Error de conexión:', {
        message: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.',
        error: error.message
      });
    } else {
      // Error al configurar la petición
      console.error('Error de configuración:', error.message);
    }

    return Promise.reject(error);
  }
);
=======
        // Error 401: No autorizado (token inválido, sesión expirada, no logueado)
        // Podrías redirigir al login automáticamente. Cuidado con bucles infinitos.
        // Ejemplo simple (podría mejorarse con el contexto de autenticación):
        // if (window.location.pathname !== '/login') {
        //   // Almacenar la ruta actual para redirigir después del login
        //   // sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        //   window.location.href = '/login';
        // }
        console.warn('Error 401: No autorizado. Redirigir a login o refrescar token si aplica.');

      } else if (status === 403) {
        // Error 403: Prohibido (Usuario logueado pero sin permisos para esa acción)
        console.warn('Error 403: Acceso prohibido.');
        // Podrías mostrar un mensaje al usuario indicando falta de permisos.
        // toast.error('No tienes permiso para realizar esta acción.'); // Si usas react-toastify

      } else if (status >= 500) {
        // Errores del servidor (5xx)
        console.error('Error interno del servidor:', status);
        // Mostrar un mensaje genérico al usuario
        // toast.error('Ha ocurrido un error en el servidor. Inténtalo más tarde.');
      }
      // Puedes añadir manejo para otros códigos de error (400, 404, 409, etc.) si es necesario

    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta (ej. red caída, backend apagado)
      console.error('Error de red o backend no responde:', error.request);
      // Mostrar un mensaje indicando problema de conexión
      // toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');

    } else {
      // Error al configurar la petición (error en el código antes de enviar)
      console.error('Error en la configuración de la petición Axios:', error.message);
    }

    // IMPORTANTE: Rechaza la promesa para que el .catch() en la llamada original
    // (ej. en el componente React) también pueda manejar el error si es necesario.
    return Promise.reject(error);
  }
);
*/
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445

// Exporta la instancia configurada para usarla en otros archivos
export default apiClient; 