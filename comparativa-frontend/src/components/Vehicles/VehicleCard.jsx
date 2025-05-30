import React from 'react';
import { Link } from 'react-router-dom';
// Importar iconos relevantes
import { FaTachometerAlt, FaGasPump, FaCalendarAlt, FaEuroSign, FaWeightHanging, FaBolt } from 'react-icons/fa';
import './VehicleCard.css'; // Importa los estilos específicos para la tarjeta
// Importar los botones de acción que irán en la tarjeta
import AddToFavoritesButton from './AddToFavoritesButton';
import AddToListButton from './AddToListButton'; // El placeholder por ahora
import { useCompare } from '../../contexts/CompareContext';

/**
 * Componente que muestra la información resumida de un vehículo en una tarjeta.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.vehicle - El objeto vehículo con sus datos.
 */
const VehicleCard = ({ vehicle }) => {
  // Ruta a la imagen placeholder (debe estar en la carpeta /public)
  const defaultImage = '/placeholder-image.png';

  // Función para manejar errores de carga de imagen
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevenir bucle infinito si el placeholder también falla
    e.target.src = defaultImage;
  };

  // Formatear precio para mostrarlo más legible
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '-';
    // Convierte a número, formatea a español con 0 decimales
    return parseFloat(price).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Construir el nombre completo del vehículo
  const vehicleName = `${vehicle.marca} ${vehicle.modelo}`;
  const vehicleVersion = vehicle.version ? `${vehicle.version}` : '';

  const { compareList, addVehicle, removeVehicle, isInCompare } = useCompare();
  const maxed = compareList.length >= 6;
  const selected = isInCompare(vehicle.id_vehiculo);

  return (
    <div className="vehicle-card card"> {/* Usa clase 'card' global y 'vehicle-card' específica */}
      {/* Enlace principal que envuelve la imagen y el contenido principal */}
      <Link to={`/vehicles/${vehicle.id_vehiculo}`} className="vehicle-card-link">
        <div className="vehicle-card-image-container">
          <img
            // Usa la imagen principal obtenida de la API o el placeholder
            src={vehicle.imagen_principal || defaultImage}
            alt={vehicleName}
            className="vehicle-card-image"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
        <div className="vehicle-card-content">
          {/* Título con Marca y Modelo */}
          <h3 className="vehicle-card-title" title={vehicleName}>
            {vehicleName}
          </h3>
          {/* Versión (si existe) */}
          {vehicleVersion && <p className="vehicle-card-version" title={vehicleVersion}>{vehicleVersion}</p>}

          {/* Sección de especificaciones clave */}
          <div className="vehicle-card-specs">
            {/* Año */}
            {vehicle.anio && <span><FaCalendarAlt /> {vehicle.anio}</span>}
            {/* Potencia */}
            {vehicle.potencia && <span><FaTachometerAlt /> {vehicle.potencia} CV</span>}
            {/* Consumo Mixto o Autonomía Eléctrica */}
            {(vehicle.combustible === 'Eléctrico' || vehicle.combustible === 'Híbrido Enchufable') ?
              (vehicle.autonomia_electrica && <span><FaBolt /> {vehicle.autonomia_electrica} km</span>)
              :
              (vehicle.consumo_mixto && <span><FaGasPump /> {vehicle.consumo_mixto} l/100km</span>)
            }
            {/* Peso */}
            {vehicle.peso && <span><FaWeightHanging /> {vehicle.peso} kg</span>}
            {/* Precio Original (Formateado) */}
            {vehicle.precio_original && (
              <span className="vehicle-card-price">
                <FaEuroSign /> {formatPrice(vehicle.precio_original)}
                {vehicle.precio_actual_estimado && vehicle.precio_actual_estimado !== vehicle.precio_original && (
                  <small> (Est. {formatPrice(vehicle.precio_actual_estimado)})</small>
                )}
              </span>
            )}
          </div>
        </div>
      </Link> {/* Fin del enlace principal */}

      {/* Sección de botones de acción (fuera del Link principal) */}
      <div className="vehicle-card-actions">
        <AddToFavoritesButton vehicleId={vehicle.id_vehiculo} />
        <AddToListButton vehicleId={vehicle.id_vehiculo} />
        <button
          className={`compare-btn${selected ? ' selected' : ''}`}
          onClick={() => selected ? removeVehicle(vehicle.id_vehiculo) : addVehicle(vehicle)}
          disabled={maxed && !selected}
          title={selected ? 'Quitar de comparativa' : maxed ? 'Máximo 6 vehículos' : 'Añadir a comparativa'}
        >
          <img src="/img/iconos/icono_comparativo.png" alt="Añadir a comparativa" />
        </button>
      </div>
    </div>
  );
};

export default VehicleCard; 