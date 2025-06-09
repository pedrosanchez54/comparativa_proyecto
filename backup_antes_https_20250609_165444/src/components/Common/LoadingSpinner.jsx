import React from 'react';
import './LoadingSpinner.css'; // Importa los estilos

/**
 * Componente reutilizable para mostrar un indicador de carga.
 * @param {object} props - Propiedades del componente.
 * @param {string} [props.size='50px'] - Tamaño del spinner (ej. '30px', '5rem').
 * @param {string} [props.message='Cargando...'] - Mensaje opcional a mostrar debajo del spinner.
 * @param {boolean} [props.overlay=true] - Si debe mostrar un fondo semi-transparente que cubra todo.
 */
const LoadingSpinner = ({ size = '50px', message = 'Cargando...', overlay = true }) => {
  const spinner = (
    <div className="spinner-container-inner">
      <div className="spinner-element" style={{ width: size, height: size }}></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );

  // Si se quiere el overlay, envolver el spinner
  if (overlay) {
    return (
      <div className="spinner-overlay">
        {spinner}
      </div>
    );
  }

  // Si no se quiere overlay, mostrar solo el spinner y mensaje
  return spinner;
};

export default LoadingSpinner; 