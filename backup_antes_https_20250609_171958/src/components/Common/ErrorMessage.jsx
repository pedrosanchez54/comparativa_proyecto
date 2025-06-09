import React from 'react';
import './ErrorMessage.css'; // Importa los estilos
import { FaExclamationTriangle } from 'react-icons/fa'; // Icono de advertencia

/**
 * Componente reutilizable para mostrar mensajes de error formateados.
 * @param {object} props - Propiedades del componente.
 * @param {string|object|null|undefined} props.message - El mensaje de error a mostrar. Puede ser un string o un objeto de error de Axios.
 */
const ErrorMessage = ({ message }) => {
  // No renderizar nada si no hay mensaje
  if (!message) return null;

  // Intentar extraer un mensaje legible si es un objeto de error (común con Axios)
  let displayMessage = 'Ha ocurrido un error desconocido.'; // Mensaje por defecto
  if (typeof message === 'string' && message.trim() !== '') {
      displayMessage = message;
  } else if (typeof message === 'object' && message !== null) {
      // Intentar obtener de la respuesta de Axios
      displayMessage = message.response?.data?.message || // Mensaje específico del backend
                       message.message || // Mensaje genérico del objeto Error
                       displayMessage; // Usar el por defecto si no se encuentra nada
       // Podrías añadir lógica para mostrar errores de validación específicos si vienen en `message.response.data.errors`
       // if (message.response?.data?.errors) { ... }
  }


  return (
    // Contenedor principal del mensaje de error
    <div className="error-message-box" role="alert"> {/* Añadir rol para accesibilidad */}
      {/* Icono de advertencia */}
      <FaExclamationTriangle className="error-icon" aria-hidden="true" />
      {/* El texto del mensaje */}
      <span>{displayMessage}</span>
    </div>
  );
};

export default ErrorMessage; 