import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
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

const initialSlot = { marca: '', modelo: '', generacion: '', motorizacion: '', version: '', anio: '' };

// --- Componente Principal ---
const ComparisonPage = () => {
  const location = useLocation(); // Hook para acceder al state pasado por navigate
  const navigate = useNavigate(); // Hook para navegación
  const [vehicles, setVehicles] = useState([]); // Estado para los datos de los vehículos a comparar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const defaultImage = '/placeholder-image.png'; // Imagen por defecto
  const [filterOptions, setFilterOptions] = useState(null);
  const [slots, setSlots] = useState(Array(6).fill().map(() => ({ ...initialSlot })));
  const columnRefs = useRef([]);
  const buttonRef = useRef(null);
  const containerRef = useRef(null); // Nuevo ref para el contenedor principal
  const [lineCoords, setLineCoords] = useState([]);

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

  // Si se accede directamente (sin state), limpiar la lista
  useEffect(() => {
    if (!location.state?.vehicleIds) {
      // Aquí deberías llamar a clearCompare() si compareList, addVehicle, removeVehicle, etc. están disponibles
    }
  }, [location.state]);

  // Cargar opciones de filtro al montar
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await apiClient.get('/vehicles/options');
        setFilterOptions(response.data);
      } catch (err) {
        setFilterOptions(null);
      }
    };
    fetchOptions();
  }, []);

  // Calcular posiciones de columnas y botón para las líneas SVG (relativas al contenedor)
  useLayoutEffect(() => {
    if (!buttonRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const btnRect = buttonRef.current.getBoundingClientRect();
    const btnX = btnRect.left + btnRect.width / 2 - containerRect.left;
    const btnY = btnRect.top - containerRect.top;
    const colCount = slots.length;
    const colWidth = containerRect.width / colCount;
    const coords = slots.map((_, idx) => {
      const ref = columnRefs.current[idx];
      let startX, startY;
      if (ref) {
        const rect = ref.getBoundingClientRect();
        startX = rect.left + rect.width / 2 - containerRect.left;
        startY = rect.bottom - containerRect.top;
      } else {
        // Si no hay ref, estimar posición
        startX = colWidth * idx + colWidth / 2;
        startY = 80; // Altura aproximada de la caja
      }
      return {
        startX,
        startY,
        endX: btnX,
        endY: btnY
      };
    });
    setLineCoords(coords);
  }, [slots, window.innerWidth]);

  // Forzar recalculo de líneas tras el render inicial y en cada resize
  useEffect(() => {
    const recalc = () => setLineCoords([]); // Forzar recalculo
    window.addEventListener('resize', recalc);
    setTimeout(recalc, 100); // Tras el primer render
    return () => window.removeEventListener('resize', recalc);
  }, []);

  // Handlers para cada filtro en cada slot
  const handleSlotChange = (slotIdx, field, value) => {
    setSlots(prev => {
      const updated = [...prev];
      // Resetear los campos dependientes si cambia un filtro superior
      const resetFields = ['marca', 'modelo', 'generacion', 'motorizacion', 'version', 'anio'];
      const resetFrom = resetFields.indexOf(field) + 1;
      updated[slotIdx] = {
        ...updated[slotIdx],
        [field]: value,
        ...Object.fromEntries(resetFields.slice(resetFrom).map(f => [f, '']))
      };
      return updated;
    });
  };

  // Obtener opciones filtradas para cada slot
  const getFilteredOptions = (slot, field) => {
    if (!filterOptions) return [];
    switch (field) {
      case 'marca':
        return filterOptions.marcas || [];
      case 'modelo':
        return filterOptions.modelos?.filter(m => m.id_marca === parseInt(slot.marca)) || [];
      case 'generacion':
        return filterOptions.generaciones?.filter(g => g.id_modelo === parseInt(slot.modelo)) || [];
      case 'motorizacion':
        return filterOptions.motorizaciones?.filter(mt => mt.id_generacion === parseInt(slot.generacion)) || [];
      case 'version':
        return filterOptions.versiones?.filter(v => v.id_motorizacion === parseInt(slot.motorizacion)) || [];
      case 'anio':
        return filterOptions.anios?.filter(a => a.id_version === parseInt(slot.version)) || [];
      default:
        return [];
    }
  };

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

  // Calcular cuántos vehículos están seleccionados (completos)
  const selectedCount = slots.filter(slot => slot.marca && slot.modelo && slot.generacion && slot.motorizacion &&
    (getFilteredOptions(slot, 'version').length === 0 || slot.version) &&
    (getFilteredOptions(slot, 'anio').length === 0 || slot.anio)).length;

  // Colores del botón según el estado
  let compareBtnColor = '#ccc'; // gris claro por defecto
  let compareBtnDisabled = true;
  if (selectedCount === 1) {
    compareBtnColor = '#b97a7a'; // gris cereza intermedio
    compareBtnDisabled = true;
  } else if (selectedCount >= 2) {
    compareBtnColor = 'var(--cherry-red)'; // rojo racing
    compareBtnDisabled = false;
  }

  // --- Renderizado ---
  // SIEMPRE renderizar la sección de selección visual arriba del todo
  // Mostrar spinner mientras carga
  if (loading) return <LoadingSpinner message="Cargando comparación..." />;

  // --- Estilos responsivos ---
  const isMobile = window.innerWidth < 600;
  const isTablet = window.innerWidth >= 600 && window.innerWidth < 1200;
  const isDesktop = window.innerWidth >= 1200;

  // Estilos para el contenedor de columnas
  let columnsContainerStyle;
  if (isMobile) {
    columnsContainerStyle = { display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', zIndex: 2, width: '100%' };
  } else if (isTablet) {
    columnsContainerStyle = {
      display: 'flex', flexWrap: 'wrap', flexDirection: 'row', gap: '24px 3%', justifyContent: 'center', alignItems: 'flex-start', zIndex: 2, width: '100%', minHeight: 320
    };
  } else {
    columnsContainerStyle = { display: 'flex', flexDirection: 'row', gap: 16, justifyContent: 'center', zIndex: 2, width: '100%' };
  }

  // Estilos para cada columna en tablet
  const columnStyle = isTablet
    ? { background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 16, minWidth: 180, maxWidth: 340, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '48%' }
    : { background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 16, minWidth: 180, maxWidth: 340, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: isMobile ? '90%' : 'auto' };

  // Estilos para el botón
  const buttonContainerStyle = isMobile
    ? { textAlign: 'center', marginTop: 24, position: 'relative', zIndex: 2 }
    : { textAlign: 'center', marginTop: 120, position: 'relative', zIndex: 2 };

  // Estilos para el contenedor principal
  const mainContainerStyle = isMobile
    ? { position: 'relative', width: '100%', margin: '20px 0', minHeight: 0 }
    : { position: 'relative', width: '100%', margin: '40px 0', minHeight: 320 };

  return (
    <div className="container vehicle-detail-page">
      {/* Botón para volver a la página anterior, igual que en detalle */}
       <button onClick={() => navigate(-1)} className="back-link">
           <FaArrowLeft /> Volver
       </button>
      <h1 className="page-title">Comparativa de Vehículos</h1>

      {/* Contenedor que envuelve columnas, botón y SVG */}
      <div ref={containerRef} style={mainContainerStyle}>
        {/* SVG de líneas curvas entre columnas y botón SOLO en escritorio */}
        {isDesktop && (
          <svg
            width="100%"
            height={containerRef.current ? containerRef.current.offsetHeight : 320}
            style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 1 }}
          >
            {lineCoords.map((coord, idx) => {
              if (!coord) return null;
              const { startX, startY, endX, endY } = coord;
              // Estado de selección
              const slot = slots[idx];
              const isComplete = slot.marca && slot.modelo && slot.generacion && slot.motorizacion &&
                (getFilteredOptions(slot, 'version').length === 0 || slot.version) &&
                (getFilteredOptions(slot, 'anio').length === 0 || slot.anio);
              // Curva Bezier: desde centro inferior de la columna a borde superior del botón
              const c1Y = startY + 60;
              const c2Y = endY - 60;
              return (
                <path
                  key={idx}
                  d={`M${startX},${startY} C${startX},${c1Y} ${endX},${c2Y} ${endX},${endY}`}
                  stroke={isComplete ? 'var(--cherry-red)' : '#bbb'}
                  strokeWidth={4}
                  fill="none"
                  style={{ transition: 'stroke 0.3s' }}
                />
              );
            })}
          </svg>
        )}
        {/* Columnas de selección */}
        <div style={columnsContainerStyle}>
          {slots.map((slot, idx) => {
            const isComplete = slot.marca && slot.modelo && slot.generacion && slot.motorizacion &&
              (getFilteredOptions(slot, 'version').length === 0 || slot.version) &&
              (getFilteredOptions(slot, 'anio').length === 0 || slot.anio);
            return (
              <div
                key={idx}
                ref={el => columnRefs.current[idx] = el}
                style={columnStyle}
              >
                <div style={{ marginBottom: 8, width: '100%' }}>
                  <select value={slot.marca} onChange={e => handleSlotChange(idx, 'marca', e.target.value)} style={{ width: '100%', marginBottom: 6 }}>
                    <option value=''>Marca</option>
                    {getFilteredOptions(slot, 'marca').map(m => <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>)}
                  </select>
                  <select value={slot.modelo} onChange={e => handleSlotChange(idx, 'modelo', e.target.value)} style={{ width: '100%', marginBottom: 6 }} disabled={!slot.marca}>
                    <option value=''>Modelo</option>
                    {getFilteredOptions(slot, 'modelo').map(mo => <option key={mo.id_modelo} value={mo.id_modelo}>{mo.nombre}</option>)}
                  </select>
                  <select value={slot.generacion} onChange={e => handleSlotChange(idx, 'generacion', e.target.value)} style={{ width: '100%', marginBottom: 6 }} disabled={!slot.modelo}>
                    <option value=''>Generación</option>
                    {getFilteredOptions(slot, 'generacion').map(g => <option key={g.id_generacion} value={g.id_generacion}>{g.nombre}</option>)}
                  </select>
                  <select value={slot.motorizacion} onChange={e => handleSlotChange(idx, 'motorizacion', e.target.value)} style={{ width: '100%', marginBottom: 6 }} disabled={!slot.generacion}>
                    <option value=''>Motorización</option>
                    {getFilteredOptions(slot, 'motorizacion').map(mt => <option key={mt.id_motorizacion} value={mt.id_motorizacion}>{mt.nombre}</option>)}
                  </select>
                  {/* Select de Versión solo si hay opciones */}
                  {getFilteredOptions(slot, 'version').length > 0 && (
                    <>
                      <select value={slot.version} onChange={e => handleSlotChange(idx, 'version', e.target.value)} style={{ width: '100%', marginBottom: 6 }} disabled={!slot.motorizacion}>
                        <option value=''>Versión (opcional)</option>
                        {getFilteredOptions(slot, 'version').map(v => <option key={v.id_version} value={v.id_version}>{v.nombre}</option>)}
                      </select>
                      <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: 4 }} title="La mayoría de vehículos no tienen versión específica">(Opcional, pocos vehículos tienen versión)</div>
                    </>
                  )}
                  {/* Select de Año solo si hay opciones */}
                  {getFilteredOptions(slot, 'anio').length > 0 && (
                    <>
                      <select value={slot.anio} onChange={e => handleSlotChange(idx, 'anio', e.target.value)} style={{ width: '100%' }} disabled={!slot.version}>
                        <option value=''>Año (opcional)</option>
                        {getFilteredOptions(slot, 'anio').map(a => <option key={a.anio} value={a.anio}>{a.anio}</option>)}
                      </select>
                      <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: 4 }} title="El año solo está disponible en algunos vehículos">(Opcional, pocos vehículos tienen año seleccionable)</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Botón de comparar centrado debajo de las columnas */}
        <div style={buttonContainerStyle}>
          <button ref={buttonRef}
            style={{ padding: '12px 36px', fontSize: '1.2rem', borderRadius: 8, background: compareBtnColor, color: '#fff', border: 'none', fontWeight: 700, cursor: compareBtnDisabled ? 'not-allowed' : 'pointer', position: 'relative', zIndex: 2, transition: 'background 0.2s' }}
            disabled={compareBtnDisabled}
          >
            Comparar
          </button>
        </div>
      </div>

      {/* Mostrar error y botón para volver si falla la carga o no hay suficientes datos */}
      {error || vehicles.length < 2 ? (
        <div className="container" style={{paddingTop: '20px'}}>
          <ErrorMessage message={error || 'No hay suficientes vehículos para comparar.'} />
        </div>
      ) : (
        // ... el resto del renderizado de la tabla y gráficos ...
        <>
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
          {graphSpecs.map(specInfo => {
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
          }).filter(Boolean)}
        </>
        )}
    </div>
  );
};

export default ComparisonPage; 