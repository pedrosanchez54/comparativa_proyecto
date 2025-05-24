import React from 'react';
import { Link } from 'react-router-dom';
// Importar iconos relevantes
<<<<<<< HEAD
import { FaTachometerAlt, FaGasPump, FaCalendarAlt, FaEuroSign, FaBolt } from 'react-icons/fa';
=======
import { FaTachometerAlt, FaGasPump, FaCalendarAlt, FaEuroSign, FaWeightHanging, FaBolt, FaInfoCircle } from 'react-icons/fa';
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
import './VehicleCard.css'; // Importa los estilos específicos para la tarjeta
// Importar los botones de acción que irán en la tarjeta
import AddToFavoritesButton from './AddToFavoritesButton';
import AddToListButton from './AddToListButton'; // El placeholder por ahora

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

  return (
    <div className="vehicle-card card"> {/* Usa clase 'card' global y 'vehicle-card' específica */}
      {/* Enlace principal que envuelve la imagen y el contenido principal */}
      <Link to={`/vehicles/${vehicle.id_vehiculo}`} className="vehicle-card-link">
        <div className="vehicle-card-image-container">
          <img
            // Usa la imagen principal obtenida de la API o el placeholder
            src={vehicle.imagen_principal || defaultImage}
            alt={`${vehicle.marca} ${vehicle.modelo}`}
            className="vehicle-card-image"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
        <div className="vehicle-card-content">
          {/* Título con Marca y Modelo */}
          <h3 className="vehicle-card-title" title={`${vehicle.marca} ${vehicle.modelo}`}>
            {vehicle.marca} {vehicle.modelo}
          </h3>
          {/* Versión (si existe) */}
          {vehicle.version && <p className="vehicle-card-version" title={vehicle.version}>{vehicle.version}</p>}

          {/* Sección de especificaciones clave */}
          <div className="vehicle-card-specs">
            {/* Año */}
            {vehicle.anio && <span><FaCalendarAlt /> {vehicle.anio}</span>}
<<<<<<< HEAD
            
            {/* Motorización y Potencia */}
            {vehicle.motorizacion && vehicle.potencia && (
              <span title={vehicle.motorizacion}>
                <FaTachometerAlt /> {vehicle.potencia} CV
              </span>
            )}
            
            {/* Consumo o Autonomía */}
            {vehicle.combustible === 'Eléctrico' ? (
              vehicle.autonomia_electrica && <span><FaBolt /> {vehicle.autonomia_electrica} km</span>
            ) : (
              vehicle.consumo_mixto && <span><FaGasPump /> {vehicle.consumo_mixto} l/100km</span>
            )}
            
            {/* Precio */}
            {vehicle.precio_original && (
              <span className="vehicle-card-price">
                <FaEuroSign /> {formatPrice(vehicle.precio_original)}
              </span>
            )}
=======
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
                <small> (Orig.)</small> {/* Indicador opcional */}
              </span>
            )}
             {/* Precio Actual Estimado (Opcional, si quieres mostrarlo aquí) */}
             {/* {vehicle.precio_actual_estimado && (
                <span className="vehicle-card-price estimated">
                    <FaEuroSign /> {formatPrice(vehicle.precio_actual_estimado)}
                    <small> (Est.)</small>
                </span>
             )} */}
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
          </div>
        </div>
      </Link> {/* Fin del enlace principal */}

      {/* Sección de botones de acción (fuera del Link principal) */}
      <div className="vehicle-card-actions">
        {/* Botón Ver Detalles (alternativa si el enlace principal no es obvio) */}
        {/* <Link to={`/vehicles/${vehicle.id_vehiculo}`} className="action-button info" title="Ver detalles">
           <FaInfoCircle />
        </Link> */}
        <AddToFavoritesButton vehicleId={vehicle.id_vehiculo} />
        <AddToListButton vehicleId={vehicle.id_vehiculo} />
      </div>
    </div>
  );
};

export default VehicleCard; 