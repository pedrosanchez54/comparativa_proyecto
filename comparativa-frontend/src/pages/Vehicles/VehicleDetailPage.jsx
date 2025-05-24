import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useParams para leer ID, Link/useNavigate para navegación
import apiClient from '../../services/api'; // Nuestro cliente Axios
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import AddToFavoritesButton from '../../components/Vehicles/AddToFavoritesButton'; // Botón reutilizable
import AddToListButton from '../../components/Vehicles/AddToListButton'; // Botón reutilizable (placeholder)
import { FaArrowLeft, FaImage, FaClock, FaInfoCircle, FaRulerCombined, FaCogs, FaLeaf, FaBolt as FaElectric, FaGasPump as FaFuel, FaTachometerAlt, FaCalendarAlt, FaEuroSign } from 'react-icons/fa'; // Iconos
import { format, parseISO } from 'date-fns'; // Para formatear fechas
import { es } from 'date-fns/locale'; // Para formato español
import './VehicleDetailPage.css'; // Estilos específicos

const VehicleDetailPage = () => {
  const { id_vehiculo } = useParams(); // Obtener el ID del vehículo de la URL (definido en App.js como /vehicles/:id_vehiculo)
  const navigate = useNavigate(); // Hook para navegar programáticamente (ej. botón volver)
  const [vehicle, setVehicle] = useState(null); // Estado para almacenar los datos del vehículo
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado para mensajes de error
  const [activeTab, setActiveTab] = useState('specs'); // Pestaña activa por defecto: 'specs', 'images', 'times'
  const defaultImage = '/placeholder-image.png'; // Ruta a la imagen por defecto en /public

  // useCallback para memorizar la función de carga de datos
  const fetchVehicleDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Llamada a la API para obtener los detalles del vehículo por ID
      const response = await apiClient.get(`/vehicles/${id_vehiculo}`);
      setVehicle(response.data.data); // Guardar los datos en el estado
    } catch (err) {
      // Manejar errores (ej. vehículo no encontrado 404, error de servidor 500)
      const errorMsg = err.response?.status === 404
        ? 'Vehículo no encontrado.'
        : 'Error al cargar los detalles del vehículo. Inténtalo de nuevo más tarde.';
      setError(errorMsg);
      console.error("Error fetching vehicle details:", err.response?.data || err.message);
    } finally {
      setLoading(false); // Finalizar estado de carga
    }
  }, [id_vehiculo]); // Dependencia: se re-crea si el ID de la URL cambia

  // useEffect para ejecutar la carga de datos cuando el componente se monta o el ID cambia
  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  // --- Funciones Auxiliares de Renderizado ---

  // Formatea un número con separador de miles español
  const formatNumber = (value) => {
      if (value === null || value === undefined) return '-';
      return parseFloat(value).toLocaleString('es-ES');
  };

   // Formatea una fecha (si existe) a dd/MM/yyyy
   const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            // parseISO maneja diferentes formatos ISO como los que devuelve MySQL
            return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return dateString; // Devolver original si hay error
        }
   };

    // Formatea tiempo de vuelta HH:MM:SS.ms (opcionalmente quita HH si es 00)
   const formatLapTime = (timeString) => {
        if (!timeString) return '-';
        if (timeString.startsWith("00:")) {
            return timeString.substring(3); // Formato MM:SS.ms
        }
        return timeString; // Formato HH:MM:SS.ms
   };

   // Renderiza una línea de especificación si el valor existe
   // Añade unidad y formato numérico opcional
   const renderSpec = (label, value, unit = '', isPrice = false) => {
        if (value === null || value === undefined || value === '') {
            return null; // No renderizar si no hay valor
        }
        let displayValue = value;
        if (typeof value === 'number') {
            displayValue = formatNumber(value);
        }
        if (isPrice) {
            displayValue = formatNumber(value); // Asegurar formato numérico para precios
        }

        return (
        <p><strong>{label}:</strong> <span>{displayValue}{unit ? ` ${unit}` : ''}</span></p>
        );
   };

  // --- Renderizado Condicional ---

  if (loading) return <LoadingSpinner message="Cargando detalles del vehículo..." />;
  if (error) return (
      <div className="container" style={{paddingTop: '20px'}}>
          <ErrorMessage message={error} />
          <button onClick={() => navigate('/vehicles')} className="btn btn-secondary mt-2">
              <FaArrowLeft /> Volver al catálogo
          </button>
      </div>
  );
  // Si no está cargando, no hay error, pero no hay datos de vehículo
  if (!vehicle) return (
      <div className="container" style={{paddingTop: '20px'}}>
          <p>No se encontraron datos para este vehículo.</p>
          <button onClick={() => navigate('/vehicles')} className="btn btn-secondary mt-2">
              <FaArrowLeft /> Volver al catálogo
          </button>
      </div>
  );

  // --- Preparación de Datos para Renderizar ---
  // Agrupar especificaciones por categorías lógicas
  const generalSpecs = [
    renderSpec('Marca', vehicle.marca),
    renderSpec('Modelo', vehicle.modelo),
    renderSpec('Generación', vehicle.generacion),
    renderSpec('Motorización', vehicle.motorizacion),
    renderSpec('Versión', vehicle.version),
    renderSpec('Año', vehicle.anio),
    renderSpec('Tipo', vehicle.tipo),
    renderSpec('Combustible', vehicle.combustible),
    renderSpec('Etiqueta DGT', vehicle.pegatina_ambiental),
    renderSpec('Precio Original', vehicle.precio_original, '€', true),
    renderSpec('Precio Actual Estimado', vehicle.precio_actual_estimado, '€', true),
    renderSpec('Lanzamiento', formatDate(vehicle.fecha_lanzamiento)),
  ].filter(Boolean);

  const performanceSpecs = [
     renderSpec('Potencia', vehicle.potencia, 'CV'), renderSpec('Par Motor', vehicle.par_motor, 'Nm'),
     renderSpec('Velocidad Máx.', vehicle.velocidad_max, 'km/h'), renderSpec('0-100 km/h', vehicle.aceleracion_0_100, 's'),
     renderSpec('Frenada 100-0 km/h', vehicle.distancia_frenado_100_0, 'm'),
     renderSpec('Relación Peso/Potencia', vehicle.potencia && vehicle.peso ? (vehicle.peso / vehicle.potencia).toFixed(2) : null, 'kg/CV'),
  ].filter(Boolean);

   const consumptionSpecs = [
     renderSpec('Consumo Urbano', vehicle.consumo_urbano, vehicle.combustible?.startsWith('Eléctrico') ? 'kWh/100km' : 'l/100km'),
     renderSpec('Consumo Extraurbano', vehicle.consumo_extraurbano, vehicle.combustible?.startsWith('Eléctrico') ? 'kWh/100km' : 'l/100km'),
     renderSpec('Consumo Mixto', vehicle.consumo_mixto, vehicle.combustible?.startsWith('Eléctrico') ? 'kWh/100km' : 'l/100km'),
     renderSpec('Emisiones CO2', vehicle.emisiones, 'g/km'),
   ].filter(Boolean);

    const electricSpecs = (vehicle.combustible === 'Eléctrico' || vehicle.combustible === 'Híbrido Enchufable') ? [
     renderSpec('Autonomía Eléctrica (WLTP)', vehicle.autonomia_electrica, 'km'),
     renderSpec('Capacidad Batería (útil)', vehicle.capacidad_bateria, 'kWh'),
     renderSpec('Tiempo Carga AC (aprox)', vehicle.tiempo_carga_ac, 'h'),
     renderSpec('Potencia Máx. Carga DC', vehicle.potencia_carga_dc, 'kW'),
     renderSpec('Tiempo Carga DC 10-80% (aprox)', vehicle.tiempo_carga_dc_10_80, 'min'),
   ].filter(Boolean) : [];

   const dimensionsSpecs = [
     renderSpec('Largo', vehicle.dimension_largo, 'mm'), renderSpec('Ancho', vehicle.dimension_ancho, 'mm'),
     renderSpec('Alto', vehicle.dimension_alto, 'mm'), renderSpec('Distancia entre ejes', vehicle.distancia_entre_ejes, 'mm'),
     renderSpec('Peso', vehicle.peso, 'kg'), renderSpec('Puertas', vehicle.num_puertas), renderSpec('Plazas', vehicle.num_plazas),
     renderSpec('Maletero', vehicle.vol_maletero, 'l'),
     renderSpec('Maletero Máx.', vehicle.vol_maletero_max, 'l'),
   ].filter(Boolean);

   const transmissionSpecs = [
        renderSpec('Tracción', vehicle.traccion), renderSpec('Caja de Cambios', vehicle.caja_cambios),
        renderSpec('Nº de Marchas', vehicle.num_marchas),
   ].filter(Boolean);

  // --- Renderizado Principal ---
  return (
    <div className="container vehicle-detail-page" style={{paddingTop: '20px'}}>
      {/* Enlace para volver */}
      <button onClick={() => navigate(-1)} className="back-link"> {/* navigate(-1) vuelve a la página anterior */}
          <FaArrowLeft /> Volver
      </button>

      {/* Cabecera con título y botones de acción */}
      <div className="detail-header">
        <h1>{vehicle.marca} {vehicle.modelo} {vehicle.version && ` ${vehicle.version}`} ({vehicle.anio})</h1>
        <div className="detail-actions">
           <AddToFavoritesButton vehicleId={vehicle.id_vehiculo} />
           <AddToListButton vehicleId={vehicle.id_vehiculo} />
        </div>
      </div>

      {/* Pestañas para organizar la información */}
      <div className="detail-tabs">
        <button onClick={() => setActiveTab('specs')} className={`tab-button ${activeTab === 'specs' ? 'active' : ''}`}><FaInfoCircle/> Especificaciones</button>
        <button onClick={() => setActiveTab('images')} className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}><FaImage /> Imágenes ({vehicle.imagenes?.length || 0})</button>
        <button onClick={() => setActiveTab('times')} className={`tab-button ${activeTab === 'times' ? 'active' : ''}`}><FaClock/> Tiempos Circuito ({vehicle.tiempos_circuito?.length || 0})</button>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="tab-content card">
        {/* Pestaña Especificaciones */}
        {activeTab === 'specs' && (
          <div className="specs-section">
            <h2><FaInfoCircle /> Especificaciones Técnicas</h2>
            <div className="specs-grid">
               {generalSpecs.length > 0 && <div className="spec-category"><h3><FaCalendarAlt /> General / Precio</h3>{generalSpecs}</div>}
               {performanceSpecs.length > 0 && <div className="spec-category"><h3><FaTachometerAlt /> Rendimiento</h3>{performanceSpecs}</div>}
               {consumptionSpecs.length > 0 && <div className="spec-category"><h3><FaFuel /> Consumo y Emisiones</h3>{consumptionSpecs}</div>}
               {electricSpecs.length > 0 && <div className="spec-category"><h3><FaElectric /> Eléctrico / Híbrido</h3>{electricSpecs}</div>}
               {dimensionsSpecs.length > 0 && <div className="spec-category"><h3><FaRulerCombined /> Dimensiones y Capacidad</h3>{dimensionsSpecs}</div>}
               {transmissionSpecs.length > 0 && <div className="spec-category"><h3><FaCogs /> Transmisión</h3>{transmissionSpecs}</div>}
            </div>
            {/* Detalles adicionales en formato JSON */}
            {vehicle.detalle && (
              <div className="spec-category">
                <h3><FaInfoCircle /> Detalles adicionales</h3>
                {typeof vehicle.detalle === 'object' && !Array.isArray(vehicle.detalle) ? (
                  <ul>
                    {Object.entries(vehicle.detalle).map(([key, value]) => (
                      <li key={key}><strong>{key}:</strong> {String(value)}</li>
                    ))}
                  </ul>
                ) : (
                  <pre>{String(vehicle.detalle)}</pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pestaña Imágenes */}
        {activeTab === 'images' && (
          <div className="images-section">
            <h2><FaImage /> Galería de Imágenes</h2>
            {vehicle.imagenes && vehicle.imagenes.length > 0 ? (
              <div className="image-gallery">
                {vehicle.imagenes.map((img) => (
                  <div key={img.id_imagen} className="gallery-item">
                    <a href={img.ruta_local} target="_blank" rel="noopener noreferrer" title={img.descripcion || 'Ver imagen completa'}>
                      <img
                        src={img.ruta_local}
                        alt={img.descripcion || `${vehicle.marca} ${vehicle.modelo}`}
                        onError={(e) => { e.target.onerror = null; e.target.src=defaultImage; }}
                        loading="lazy"
                      />
                      {img.descripcion && <p>{img.descripcion}</p>}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay imágenes disponibles para este vehículo.</p>
            )}
          </div>
        )}

        {/* Pestaña Tiempos de Circuito */}
        {activeTab === 'times' && (
          <div className="times-section">
            <h2><FaClock /> Tiempos Registrados en Circuito</h2>
            {vehicle.tiempos_circuito && vehicle.tiempos_circuito.length > 0 ? (
              <div className="times-table-container">
                 <table className='table'> {/* Usar clase global 'table' si existe */}
                    <thead>
                        <tr>
                        <th>Circuito</th>
                        <th>Tiempo</th>
                        <th>Condiciones</th>
                        <th>Fecha</th>
                        <th>Piloto</th>
                        <th>Neumáticos</th>
                        <th>Fuente</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicle.tiempos_circuito.map((time) => (
                        <tr key={time.id_tiempo}>
                            <td>{time.circuito}</td>
                            <td>{formatLapTime(time.tiempo_vuelta)}</td>
                            <td>{time.condiciones || '-'}</td>
                            <td>{formatDate(time.fecha_record)}</td>
                            <td>{time.piloto || '-'}</td>
                            <td>{time.neumaticos || '-'}</td>
                            <td>
                            {/* Enlace a la fuente si existe */}
                            {time.fuente_url ? (
                                <a href={time.fuente_url} target="_blank" rel="noopener noreferrer" className='btn btn-secondary btn-sm'>Ver Fuente</a>
                            ) : (
                                '-'
                            )}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                 </table>
              </div>
            ) : (
              <p>No hay tiempos de circuito registrados para este vehículo.</p>
            )}
          </div>
        )}
      </div> {/* Fin de tab-content */}
    </div> // Fin de vehicle-detail-page
  );
};

export default VehicleDetailPage; 