import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom'; // useLocation para obtener state
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { FaArrowLeft } from 'react-icons/fa';
// Importar Chart.js y react-chartjs-2
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, // Eje X (categorías)
  LinearScale,   // Eje Y (valores numéricos)
  BarElement,    // Elemento de barra
  Title,         // Título del gráfico
  Tooltip,       // Información al pasar el ratón
  Legend,        // Leyenda (opcional)
} from 'chart.js';
import './ComparisonPage.css'; // Estilos específicos

// Registrar los componentes de Chart.js que vamos a usar
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- Configuración de la Tabla y Gráficos ---

// Mapeo de claves de datos a etiquetas legibles para la tabla y gráficos
const specLabels = {
    // General
    marca: 'Marca', modelo: 'Modelo', version: 'Versión', año: 'Año', tipo: 'Tipo',
    combustible: 'Combustible', pegatina_ambiental: 'Etiqueta DGT',
    precio_original: 'Precio Original (€)', precio_actual_estimado: 'Precio Actual Est. (€)',
    // Rendimiento
    potencia: 'Potencia (CV)', par_motor: 'Par Motor (Nm)', velocidad_max: 'Velocidad Máx. (km/h)',
    aceleracion_0_100: '0-100 km/h (s)', distancia_frenado_100_0: 'Frenada 100-0 (m)',
    // Consumo / Emisiones
    consumo_mixto: 'Consumo Mixto', emisiones: 'Emisiones CO2 (g/km)',
    // Eléctrico
    autonomia_electrica: 'Autonomía Eléctrica (km)', capacidad_bateria: 'Batería (kWh)',
    // Dimensiones / Capacidad
    peso: 'Peso (kg)', num_puertas: 'Puertas', num_plazas: 'Plazas', vol_maletero: 'Maletero (l)',
    dimension_largo: 'Largo (mm)', dimension_ancho: 'Ancho (mm)', dimension_alto: 'Alto (mm)',
    // Transmisión
    traccion: 'Tracción', caja_cambios: 'Caja Cambios', num_marchas: 'Nº Marchas',
    // Añade más etiquetas si incluyes más campos en specOrder
};

 // Orden y selección de especificaciones a mostrar en la tabla
const specOrder = [
    'marca', 'modelo', 'version', 'año', 'precio_original', 'precio_actual_estimado', 'tipo', 'combustible', 'pegatina_ambiental',
    'potencia', 'par_motor', 'peso', 'aceleracion_0_100', 'velocidad_max', 'distancia_frenado_100_0',
    'consumo_mixto', 'emisiones',
    'autonomia_electrica', 'capacidad_bateria',
    'traccion', 'caja_cambios', 'num_marchas', 'num_puertas', 'num_plazas', 'vol_maletero',
    'dimension_largo', 'dimension_ancho', 'dimension_alto',
];

// Claves de especificaciones que queremos visualizar con gráficos de barras
const graphSpecs = [
    { key: 'potencia', label: 'Potencia (CV)', higherIsBetter: true },
    { key: 'aceleracion_0_100', label: 'Aceleración 0-100 km/h (s)', higherIsBetter: false },
    { key: 'distancia_frenado_100_0', label: 'Frenada 100-0 km/h (m)', higherIsBetter: false },
    { key: 'precio_actual_estimado', label: 'Precio Actual Estimado (€)', higherIsBetter: false },
    { key: 'autonomia_electrica', label: 'Autonomía Eléctrica (km)', higherIsBetter: true },
    { key: 'vol_maletero', label: 'Maletero (l)', higherIsBetter: true },
];


// --- Componente Principal ---
const ComparisonPage = () => {
  const location = useLocation(); // Hook para acceder al state pasado por navigate
  const navigate = useNavigate(); // Hook para navegación
  const [vehicles, setVehicles] = useState([]); // Estado para los datos de los vehículos a comparar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const defaultImage = '/placeholder-image.png'; // Imagen por defecto

  // Obtener los IDs de los vehículos del estado de navegación
  const vehicleIds = location.state?.vehicleIds;

  // Función para cargar los datos de los vehículos a comparar
  const fetchComparisonData = useCallback(async () => {
    // Validar que tenemos IDs y al menos 2
    if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length < 2) {
      setError('Se necesitan al menos 2 vehículos para comparar. Vuelve atrás y selecciona los vehículos.');
      setLoading(false);
      setVehicles([]); // Asegurar que vehicles está vacío
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Crear el query param ?ids=id1,id2,id3...
      const idsQueryParam = vehicleIds.join(',');
      // Llamar al endpoint específico de comparación del backend
      const response = await apiClient.get(`/vehicles/compare?ids=${idsQueryParam}`);

      // Validar que la respuesta contiene datos y al menos 2 vehículos
      if (!response.data?.data || response.data.data.length < 2) {
          setError('No se encontraron suficientes datos para los vehículos seleccionados.');
          setVehicles([]);
      } else {
         // Guardar los datos de los vehículos en el estado
         setVehicles(response.data.data);
      }
    } catch (err) {
      setError('Error al cargar los datos para la comparación.');
      console.error("Error fetching comparison data:", err.response?.data || err.message);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [vehicleIds]); // Dependencia: IDs de vehículos

  // useEffect para cargar los datos cuando el componente se monta o los IDs cambian
  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  // --- Funciones Auxiliares ---

  // Obtiene la URL de la imagen principal o la por defecto
  const getPrimaryImage = (vehicle) => {
    return vehicle.imagen_principal || '/placeholder-image.png';
  };

   // Formatea un número o devuelve '-'
   const formatValue = (value) => {
        if (value === null || value === undefined || value === '') return '-';
        if (typeof value === 'number') {
            // Formato español, ajustar decimales si es necesario
            return value.toLocaleString('es-ES', { maximumFractionDigits: 1 });
        }
        return value; // Devolver string tal cual
   };

   // Determina si un valor es el "mejor" entre un conjunto de valores para una métrica dada
   const isBestValue = (specKey, currentValue, allValues) => {
       if (currentValue === null || currentValue === undefined || currentValue === '') return false;

       const numericValues = allValues
                                .map(v => parseFloat(v)) // Convertir a número
                                .filter(v => !isNaN(v)); // Filtrar los que no son números

       if (numericValues.length < 2) return false; // No hay comparación si hay menos de 2 valores numéricos

       const currentNumericValue = parseFloat(currentValue);
       let bestValue;

       // Determinar si "mejor" es el valor más alto o más bajo según la métrica
       const metricInfo = graphSpecs.find(spec => spec.key === specKey);
       const higherIsBetter = metricInfo ? metricInfo.higherIsBetter : undefined;

       if (higherIsBetter === true) { // Más alto es mejor (ej. potencia)
           bestValue = Math.max(...numericValues);
           return currentNumericValue === bestValue;
       } else if (higherIsBetter === false) { // Más bajo es mejor (ej. precio, consumo, aceleración)
           bestValue = Math.min(...numericValues);
           return currentNumericValue === bestValue;
       }

       return false; // No comparar si no se define si mayor o menor es mejor
   };

  // --- Renderizado ---
  if (loading) return <LoadingSpinner message="Cargando comparación..." />;
  // Mostrar error y botón para volver si falla la carga o no hay suficientes datos
  if (error || vehicles.length < 2) return (
      <div className="container comparison-page" style={{paddingTop: '20px'}}>
          <ErrorMessage message={error || 'No hay suficientes vehículos para comparar.'} />
          <button onClick={() => navigate(-1)} className="btn btn-secondary mt-2">
              <FaArrowLeft /> Volver
          </button>
      </div>
  );

  // --- Preparación de Datos para Gráficos ---
  const chartComponents = graphSpecs.map(specInfo => {
      const { key, label, higherIsBetter } = specInfo;
      // Filtrar vehículos que tengan un valor numérico válido para esta métrica
      const validVehicles = vehicles.filter(v => v[key] !== null && v[key] !== undefined && !isNaN(parseFloat(v[key])));

      // No renderizar gráfico si no hay al menos 2 vehículos con datos válidos
      if (validVehicles.length < 2) return null;

      const chartData = {
          labels: validVehicles.map(v => `${v.marca} ${v.modelo}`.substring(0, 30)), // Nombres cortos
          datasets: [{
              label: label,
              data: validVehicles.map(v => parseFloat(v[key])),
              backgroundColor: [ // Paleta de colores
                  'rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)',
                  'rgba(75, 192, 192, 0.7)', 'rgba(255, 206, 86, 0.7)',
              ],
              borderColor: [
                  'rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)',
                  'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)',
              ],
              borderWidth: 1,
          }],
      };
      const chartOptions = {
          indexAxis: 'y', // Barras horizontales
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: { display: false },
              title: { display: true, text: label },
              tooltip: {
                  callbacks: { label: (context) => `${context.dataset.label}: ${formatValue(context.parsed.x)}` }
              }
          },
          scales: { x: { beginAtZero: true, title: { display: true, text: label.split('(')[1]?.replace(')','') || label } }, y: { ticks: { autoSkip: false } } }
      };
      // Calcular altura dinámica basada en número de vehículos
      const chartHeight = `${validVehicles.length * 40 + 80}px`;

      return (
          <div key={key} className="chart-container" style={{ height: chartHeight, position: 'relative', marginBottom: '30px' }}>
              <Bar options={chartOptions} data={chartData} />
          </div>
      );
  }).filter(Boolean); // Filtrar los null si no se generó gráfico


  // --- Renderizado Principal ---
  return (
    <div className="page-container comparison-page">
       {/* Botón para volver a la página anterior */}
       <button onClick={() => navigate(-1)} className="back-link">
           <FaArrowLeft /> Volver
       </button>
      <h1 className="page-title">Comparativa de Vehículos</h1>

      {/* Contenedor de la tabla con scroll */}
      <div className="comparison-table-container">
        <table className="comparison-table">
          {/* Encabezado Fijo (Sticky) */}
          <thead>
            <tr>
              {/* Celda vacía o con título para la columna de especificaciones */}
              <th className='spec-label-col'>Especificación</th>
              {/* Cabecera para cada vehículo */}
              {vehicles.map((vehicle) => (
                <th key={vehicle.id_vehiculo} className="vehicle-header-col">
                   {/* Enlace a la página de detalle del vehículo */}
                   <Link to={`/vehicles/${vehicle.id_vehiculo}`}>
                       <img
                            src={getPrimaryImage(vehicle)}
                            alt={`${vehicle.marca} ${vehicle.modelo}`}
                            className="comparison-header-image"
                            onError={(e) => { e.target.onerror = null; e.target.src=defaultImage; }}
                            loading="lazy"
                       />
                       <span className='comparison-header-name'>{vehicle.marca} {vehicle.modelo}</span>
                        {vehicle.generacion && <span className='comparison-header-generation'>{vehicle.generacion}</span>}
                        {vehicle.motorizacion && <span className='comparison-header-motor'>{vehicle.motorizacion}</span>}
                        {vehicle.version && <span className='comparison-header-version'>{vehicle.version}</span>}
                         <span className='comparison-header-year'>({vehicle.anio})</span>
                   </Link>
                </th>
              ))}
            </tr>
          </thead>
          {/* Cuerpo de la tabla con las especificaciones */}
          <tbody>
            {/* Iterar sobre el orden definido de especificaciones */}
            {specOrder.map((key) => {
                 // Comprobar si la etiqueta existe y si al menos un vehículo tiene dato para esta clave
                const label = specLabels[key];
                const hasData = vehicles.some(v => v[key] !== null && v[key] !== undefined && v[key] !== '');

                // Si no hay etiqueta o ningún coche tiene dato, no mostrar la fila
                if (!label || !hasData) return null;

                // Obtener todos los valores para esta clave para la lógica de 'best value'
                const allValuesForKey = vehicles.map(v => v[key]);

              return (
                <tr key={key}>
                  {/* Celda con la etiqueta de la especificación (fija a la izquierda) */}
                  <td className='spec-label-col'>{label}</td>
                  {/* Celda para cada vehículo con su valor */}
                  {vehicles.map((vehicle) => {
                      const value = vehicle[key];
                      // Determinar si este valor es el "mejor" (para resaltarlo)
                      const isBest = isBestValue(key, value, allValuesForKey);
                    return (
                        <td key={`${vehicle.id_vehiculo}-${key}`} className={`spec-value ${isBest ? 'best-value' : ''}`}>
                            {/* Formatear el valor para mostrarlo */}
                            {formatValue(value)}
                        </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>{/* Fin de comparison-table-container */}

        {/* Sección de Gráficos (si hay alguno para mostrar) */}
        {chartComponents.length > 0 && (
             <div className="comparison-charts-section card">
               <h2>Visualización Gráfica</h2>
               {chartComponents}
             </div>
        )}

    </div> // Fin de comparison-page
  );
};

export default ComparisonPage; 