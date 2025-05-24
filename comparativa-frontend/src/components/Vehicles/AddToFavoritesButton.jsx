import React from 'react';

/**
 * Botón para añadir o quitar un vehículo de la lista de favoritos del usuario.
 * @param {object} props - Propiedades.
 * @param {number} props.vehicleId - El ID del vehículo al que se asocia el botón.
 */
const AddToFavoritesButton = ({ vehicleId }) => {
  // Placeholder: no hace nada
  return (
    <button className="btn btn-outline-secondary btn-sm" style={{marginRight: '5px'}} disabled title="Añadir a favoritos (no implementado)">
      ★
    </button>
  );
};

export default AddToFavoritesButton; 