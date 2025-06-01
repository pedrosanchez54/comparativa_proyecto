import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import BackButton from '../../components/Common/BackButton';
import ScrollToTopCar from '../../components/Common/ScrollToTopCar';
import { FaGasPump, FaBolt, FaTachometerAlt, FaRuler, FaEuroSign, FaChartBar, FaCarSide, FaTimes, FaTrophy, FaStar } from 'react-icons/fa';
import './ComparisonPage.css';

// Paleta de colores moderna para los vehículos
const VEHICLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#B983FF'
];

// Función para calcular la autonomía estimada
const calculateAutonomy = (vehicle) => {
  if (!vehicle) return null;
  
  // Si ya tiene autonomía eléctrica definida, usarla
  if (vehicle.autonomia_electrica && vehicle.autonomia_electrica > 0) {
    return vehicle.autonomia_electrica;
  }
  
  // Para vehículos eléctricos, calcular basándose en capacidad batería y consumo
  if (vehicle.combustible === 'Eléctrico' && vehicle.capacidad_bateria && vehicle.capacidad_bateria > 0) {
    // Consumo promedio eléctrico: ~20 kWh/100km (ajustar según tipo de vehículo)
    let consumoElectricoPromedio = 20; // kWh/100km
    
    switch(vehicle.tipo) {
      case 'Urbano':
      case 'Hatchback':
        consumoElectricoPromedio = 16; // Más eficientes
        break;
      case 'Sedán':
        consumoElectricoPromedio = 18;
        break;
      case 'SUV':
      case 'Pick-up':
        consumoElectricoPromedio = 25; // Menos eficientes
        break;
      case 'Deportivo':
      case 'Coupé':
        consumoElectricoPromedio = 22; // Performance oriented
        break;
      case 'Familiar':
        consumoElectricoPromedio = 19;
        break;
      default:
        consumoElectricoPromedio = 20;
        break;
    }
    
    // Autonomía = (Capacidad batería / Consumo por 100km) * 100
    return Math.round((vehicle.capacidad_bateria / consumoElectricoPromedio) * 100);
  }
  
  // Para vehículos de combustión, estimar basándose en tipo y consumo
  let estimatedTankSize = 50;
  
  switch(vehicle.tipo) {
    case 'Urbano':
    case 'Hatchback':
      estimatedTankSize = 45; // Depositos típicos pequeños
      break;
    case 'Sedán':
      estimatedTankSize = 60;
      break;
    case 'Familiar':
      estimatedTankSize = 65; // Un poco más grandes
      break;
    case 'SUV':
      estimatedTankSize = 75; // SUVs suelen tener tanques grandes
      break;
    case 'Pick-up':
      estimatedTankSize = 80; // Los más grandes
      break;
    case 'Deportivo':
    case 'Coupé':
      estimatedTankSize = 55; // Mediano, optimizado para performance
      break;
    case 'Monovolumen':
    case 'Furgoneta':
      estimatedTankSize = 80; // Grandes para viajes largos
      break;
    default:
      estimatedTankSize = 50;
      break;
  }
  
  // Si tenemos consumo mixto, calcular autonomía
  if (vehicle.consumo_mixto && vehicle.consumo_mixto > 0) {
    return Math.round((estimatedTankSize / vehicle.consumo_mixto) * 100);
  }
  
  return null;
};

// Estado inicial para slots
const initialSlot = { marca: '', modelo: '', generacion: '', motorizacion: '', version: '', anio: '' };

// Componente para mostrar una barra de progreso comparativa intercalada
const InterleavedComparisonBar = ({ vehicles, property, label, unit = '', higherIsBetter = true }) => {
  const values = vehicles.map(v => v[property]).filter(v => v != null && typeof v === 'number' && !isNaN(v) && v > 0);
  if (values.length === 0) return null;
  
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  return (
    <div className="interleaved-comparison-section">
      <h4 className="comparison-metric-title">{label}</h4>
      <div className="interleaved-bars">
        {vehicles.map((vehicle, index) => {
          const value = vehicle[property];
          if (value == null || typeof value !== 'number' || isNaN(value) || value <= 0) return null;
          
          // La barra SIEMPRE representa la proporción real del valor
          const percentage = (value / maxValue) * 100;
          
          // El ganador depende del criterio higherIsBetter
          const isBest = higherIsBetter ? value === maxValue : value === minValue;
          
          return (
            <div key={vehicle.id_vehiculo} className="interleaved-bar-item">
              <div className="vehicle-bar-header">
                <div className="vehicle-color-indicator" style={{ backgroundColor: VEHICLE_COLORS[index] }}></div>
                <span className="vehicle-name">{vehicle.marca} {vehicle.modelo}</span>
                <span className="vehicle-value">
                  {value}{unit}
                  {isBest && <FaTrophy className="best-indicator" />}
                </span>
              </div>
              <div className="comparison-bar-track">
                <div 
                  className={`comparison-bar-fill ${isBest ? 'best' : ''}`}
                  style={{ 
                    width: `${Math.min(100, Math.max(5, percentage))}%`,
                    backgroundColor: VEHICLE_COLORS[index]
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente para leyenda de vehículos
const VehicleLegend = ({ vehicles }) => (
  <div className="vehicle-legend">
    <h3>Vehículos en comparación</h3>
    <div className="legend-items">
      {vehicles.map((vehicle, index) => (
        <div key={vehicle.id_vehiculo} className="legend-item">
          <div className="legend-color" style={{ backgroundColor: VEHICLE_COLORS[index] }}></div>
          <div className="legend-info">
            <strong>{vehicle.marca} {vehicle.modelo}</strong>
            <span>{vehicle.version || vehicle.generacion} ({vehicle.anio})</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Componente para visualización de dimensiones superpuestas
const DimensionVisualization = ({ vehicles }) => {
  const maxLength = Math.max(...vehicles.map(v => v.dimension_largo || 0));
  const maxWidth = Math.max(...vehicles.map(v => v.dimension_ancho || 0));
  const maxHeight = Math.max(...vehicles.map(v => v.dimension_alto || 0));

  // Función para calcular el área/volumen y ordenar vehículos
  const getOrderedVehiclesForTopView = () => {
    return vehicles
      .map((vehicle, index) => ({
        ...vehicle,
        originalIndex: index,
        area: (vehicle.dimension_largo || 0) * (vehicle.dimension_ancho || 0)
      }))
      .sort((a, b) => b.area - a.area); // Más grandes primero (irán atrás)
  };

  const getOrderedVehiclesForSideView = () => {
    return vehicles
      .map((vehicle, index) => ({
        ...vehicle,
        originalIndex: index,
        area: (vehicle.dimension_largo || 0) * (vehicle.dimension_alto || 0)
      }))
      .sort((a, b) => b.area - a.area); // Más grandes primero (irán atrás)
  };

  return (
    <div className="dimension-visualization">
      <h4>Comparación visual de dimensiones</h4>
      
      {/* Leyenda de vehículos */}
      <div className="dimension-legend">
        <h5>Leyenda de vehículos:</h5>
        <div className="legend-items-inline">
          {vehicles.map((vehicle, index) => (
            <div key={vehicle.id_vehiculo} className="legend-item-inline">
              <div className="legend-color-box" style={{ backgroundColor: VEHICLE_COLORS[index] }}></div>
              <span className="legend-text">{vehicle.marca} {vehicle.modelo}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="dimension-container">
        <div className="dimension-view">
          <h5>Vista superior (Largo × Ancho)</h5>
          <div className="dimension-viewport">
            <div className="top-view">
              {getOrderedVehiclesForTopView().map((vehicle, stackIndex) => {
                const widthPercent = Math.min(90, ((vehicle.dimension_largo || 0) / maxLength) * 85);
                const heightPercent = Math.min(90, ((vehicle.dimension_ancho || 0) / maxWidth) * 85);
                
                return (
                  <div
                    key={vehicle.id_vehiculo}
                    className="vehicle-silhouette top"
                    style={{
                      width: `${widthPercent}%`,
                      height: `${heightPercent}%`,
                      backgroundColor: VEHICLE_COLORS[vehicle.originalIndex] + '30',
                      border: `2px solid ${VEHICLE_COLORS[vehicle.originalIndex]}`,
                      position: 'absolute',
                      top: '10%', // Todos empiezan desde el mismo punto
                      left: '10%', // Todos empiezan desde el mismo punto
                      zIndex: stackIndex + 1 // Los más grandes (primeros en orden) tienen z-index menor
                    }}
                    title={`${vehicle.marca} ${vehicle.modelo}: ${vehicle.dimension_largo}mm × ${vehicle.dimension_ancho}mm`}
                  >
                    {/* Etiqueta solo para el vehículo más pequeño (el que está delante) */}
                    {stackIndex === getOrderedVehiclesForTopView().length - 1 && (
                      <div className="dimension-label">
                        {vehicle.dimension_largo} × {vehicle.dimension_ancho} mm
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="dimension-view">
          <h5>Vista lateral (Largo × Alto)</h5>
          <div className="dimension-viewport">
            <div className="side-view">
              {getOrderedVehiclesForSideView().map((vehicle, stackIndex) => {
                const widthPercent = Math.min(90, ((vehicle.dimension_largo || 0) / maxLength) * 85);
                const heightPercent = Math.min(90, ((vehicle.dimension_alto || 0) / maxHeight) * 85);
                
                return (
                  <div
                    key={vehicle.id_vehiculo}
                    className="vehicle-silhouette side"
                    style={{
                      width: `${widthPercent}%`,
                      height: `${heightPercent}%`,
                      backgroundColor: VEHICLE_COLORS[vehicle.originalIndex] + '30',
                      border: `2px solid ${VEHICLE_COLORS[vehicle.originalIndex]}`,
                      position: 'absolute',
                      bottom: '10%', // Todos empiezan desde la misma base
                      left: '10%', // Todos empiezan desde el mismo punto
                      zIndex: stackIndex + 1 // Los más grandes (primeros en orden) tienen z-index menor
                    }}
                    title={`${vehicle.marca} ${vehicle.modelo}: ${vehicle.dimension_largo}mm × ${vehicle.dimension_alto}mm`}
                  >
                    {/* Etiqueta solo para el vehículo más pequeño (el que está delante) */}
                    {stackIndex === getOrderedVehiclesForSideView().length - 1 && (
                      <div className="dimension-label">
                        {vehicle.dimension_largo} × {vehicle.dimension_alto} mm
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="dimension-explanation">
        <p><strong>💡 Cómo leer la comparación:</strong></p>
        <ul>
          <li>Todos los vehículos se dibujan desde la misma esquina para comparar tamaños reales</li>
          <li>Los vehículos más grandes se muestran atrás (más transparentes)</li>
          <li>Los vehículos más pequeños se muestran delante (más opacos)</li>
          <li>Puedes ver exactamente cuánto sobresalen los vehículos grandes respecto a los pequeños</li>
        </ul>
      </div>
      
      <div className="dimension-specs-table">
        <table>
          <thead>
            <tr>
              <th>Vehículo</th>
              <th>Largo (mm)</th>
              <th>Ancho (mm)</th>
              <th>Alto (mm)</th>
              <th>Entre ejes (mm)</th>
              <th>Peso (kg)</th>
              <th>Maletero (L)</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle, index) => (
              <tr key={vehicle.id_vehiculo}>
                <td className="table-vehicle-name">
                  <div className="table-color-indicator" style={{ backgroundColor: VEHICLE_COLORS[index] }}></div>
                  {vehicle.marca} {vehicle.modelo}
                </td>
                <td>{vehicle.dimension_largo || 'N/A'}</td>
                <td>{vehicle.dimension_ancho || 'N/A'}</td>
                <td>{vehicle.dimension_alto || 'N/A'}</td>
                <td>{vehicle.distancia_entre_ejes || 'N/A'}</td>
                <td>{vehicle.peso || 'N/A'}</td>
                <td>{vehicle.vol_maletero || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente para resumen inteligente
const SmartSummary = ({ vehicles }) => {
  const getWinner = (property, higherIsBetter = true) => {
    const validVehicles = vehicles.filter(v => v[property] != null && typeof v[property] === 'number' && !isNaN(v[property]));
    if (validVehicles.length === 0) return null;
    
    const winner = validVehicles.reduce((prev, current) => {
      const prevValue = prev[property];
      const currentValue = current[property];
      return higherIsBetter 
        ? (currentValue > prevValue ? current : prev)
        : (currentValue < prevValue ? current : prev);
    });
    
    return winner;
  };

  const categories = [
    { 
      title: 'Más Potente', 
      property: 'potencia', 
      unit: ' CV', 
      higherIsBetter: true,
      icon: <FaTachometerAlt />,
      insight: (winner) => `Con ${winner.potencia} CV, es el más potente del grupo.`
    },
    { 
      title: 'Más Eficiente', 
      property: 'consumo_mixto', 
      unit: ' L/100km', 
      higherIsBetter: false,
      icon: <FaGasPump />,
      insight: (winner) => `Su consumo de ${winner.consumo_mixto} L/100km lo hace el más eficiente.`
    },
    { 
      title: 'Menos Emisiones', 
      property: 'emisiones', 
      unit: ' g/km', 
      higherIsBetter: false,
      icon: <FaBolt />,
      insight: (winner) => `Emite solo ${winner.emisiones} g/km de CO2, siendo el más limpio.`
    },
    { 
      title: 'Más Rápido (0-100)', 
      property: 'aceleracion_0_100', 
      unit: ' s', 
      higherIsBetter: false,
      icon: <FaTachometerAlt />,
      insight: (winner) => `Acelera de 0-100 km/h en ${winner.aceleracion_0_100}s.`
    },
    { 
      title: 'Mayor Velocidad', 
      property: 'velocidad_max', 
      unit: ' km/h', 
      higherIsBetter: true,
      icon: <FaTachometerAlt />,
      insight: (winner) => `Alcanza ${winner.velocidad_max} km/h de velocidad máxima.`
    },
    { 
      title: 'Más Espacioso', 
      property: 'vol_maletero', 
      unit: ' L', 
      higherIsBetter: true,
      icon: <FaRuler />,
      insight: (winner) => `Su maletero de ${winner.vol_maletero}L es el más amplio.`
    },
    { 
      title: 'Mejor Autonomía', 
      property: 'autonomia_calculada', 
      unit: ' km', 
      higherIsBetter: true,
      icon: <FaGasPump />,
      insight: (winner) => `Puede recorrer hasta ${winner.autonomia_calculada} km con una carga/depósito.`
    },
    { 
      title: 'Mejor Relación Peso/Potencia', 
      property: 'ratio_peso_potencia', 
      unit: ' kg/CV', 
      higherIsBetter: false,
      icon: <FaTachometerAlt />,
      insight: (winner) => `Con ${winner.ratio_peso_potencia.toFixed(1)} kg/CV, tiene la mejor relación peso/potencia.`
    }
  ];

  return (
    <div className="smart-summary">
      <h3>🏆 Ganadores por categoría</h3>
      <div className="winners-grid">
        {categories.map((category, index) => {
          const winner = getWinner(category.property, category.higherIsBetter);
          if (!winner) return null;
          
          const vehicleIndex = vehicles.findIndex(v => v.id_vehiculo === winner.id_vehiculo);
          
          return (
            <div key={index} className="winner-card">
              <div className="winner-icon">{category.icon}</div>
              <h4>{category.title}</h4>
              <div className="winner-vehicle">
                <div className="winner-color" style={{ backgroundColor: VEHICLE_COLORS[vehicleIndex] }}></div>
                <div className="winner-info">
                  <strong>{winner.marca} {winner.modelo}</strong>
                  <span>{winner[category.property]}{category.unit}</span>
                  {category.insight && (
                    <div className="winner-insight">
                      {category.insight(winner)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="summary-insights">
        <h4>💡 Insights de la comparación</h4>
        <div className="insights-list">
          {(() => {
            const insights = [];
            
            // Insight sobre precio vs prestaciones
            const mostExpensive = getWinner('precio_actual_estimado', true);
            const mostPowerful = getWinner('potencia', true);
            if (mostExpensive && mostPowerful && mostExpensive.id_vehiculo !== mostPowerful.id_vehiculo) {
              insights.push(`El ${mostPowerful.marca} ${mostPowerful.modelo} ofrece la mayor potencia sin ser el más caro.`);
            }
            
            // Insight sobre eficiencia
            const mostEfficient = getWinner('consumo_mixto', false);
            const leastEmissions = getWinner('emisiones', false);
            if (mostEfficient && leastEmissions && mostEfficient.id_vehiculo === leastEmissions.id_vehiculo) {
              insights.push(`El ${mostEfficient.marca} ${mostEfficient.modelo} destaca tanto en eficiencia como en bajas emisiones.`);
            }
            
            // Insight sobre tamaño vs practicidad
            const biggest = vehicles.reduce((prev, current) => {
              const prevSize = (prev.dimension_largo || 0) * (prev.dimension_ancho || 0);
              const currentSize = (current.dimension_largo || 0) * (current.dimension_ancho || 0);
              return currentSize > prevSize ? current : prev;
            });
            const biggestTrunk = getWinner('vol_maletero', true);
            if (biggest && biggestTrunk && biggest.id_vehiculo === biggestTrunk.id_vehiculo) {
              insights.push(`El ${biggest.marca} ${biggest.modelo} aprovecha bien su tamaño con el mayor maletero.`);
            }
            
            if (insights.length === 0) {
              insights.push('Cada vehículo tiene sus fortalezas particulares en diferentes aspectos.');
            }
            
            return insights.map((insight, idx) => (
              <div key={idx} className="insight-item">
                <FaStar className="insight-icon" />
                <span>{insight}</span>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

// Componente principal
const ComparisonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const defaultImage = '/placeholder-car.png';
  
  // Estados para el selector visual
  const [filterOptions, setFilterOptions] = useState(null);
  const [slots, setSlots] = useState(Array(6).fill().map(() => ({ ...initialSlot })));
  const [showSelector, setShowSelector] = useState(true);
  const columnRefs = useRef([]);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const [lineCoords, setLineCoords] = useState([]);

  const vehicleIds = location.state?.vehicleIds;

  // Referencias para las secciones
  const sectionRefs = {
    general: useRef(null),
    motor: useRef(null),
    consumo: useRef(null),
    dimensiones: useRef(null),
    precio: useRef(null),
    resumen: useRef(null)
  };

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

  // Cargar datos de comparación
  const fetchComparisonData = useCallback(async (ids) => {
    if (!ids || !Array.isArray(ids) || ids.length < 2) {
      setError('Se necesitan al menos 2 vehículos para comparar.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const idsQueryParam = ids.join(',');
      const response = await apiClient.get(`/vehicles/compare?ids=${idsQueryParam}`);

      if (!response.data?.data || response.data.data.length < 2) {
        setError('No se encontraron suficientes datos para los vehículos seleccionados.');
        setVehicles([]);
      } else {
        const vehiclesWithCalculations = response.data.data.map(v => ({
          ...v,
          autonomia_calculada: calculateAutonomy(v),
          ratio_peso_potencia: (v.peso && v.potencia && v.potencia > 0) ? v.peso / v.potencia : null
        }));
        setVehicles(vehiclesWithCalculations);
        setShowSelector(false);
      }
    } catch (err) {
      setError('Error al cargar los datos para la comparación.');
      console.error("Error:", err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto inicial para determinar si mostrar selector o comparación
  useEffect(() => {
    if (vehicleIds && vehicleIds.length >= 2) {
      setShowSelector(false);
      fetchComparisonData(vehicleIds);
    } else {
      setShowSelector(true);
      setLoading(false);
    }
  }, [vehicleIds, fetchComparisonData]);

  // Calcular posiciones de líneas para el selector visual
  useLayoutEffect(() => {
    if (!showSelector || !buttonRef.current || !containerRef.current) return;
    
    const updateLineCoords = () => {
      try {
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
        startX = colWidth * idx + colWidth / 2;
            startY = 80;
          }
          return { startX, startY, endX: btnX, endY: btnY };
        });
        setLineCoords(coords);
      } catch (err) {
        console.error('Error updating line coords:', err);
      }
    };

    updateLineCoords();
    window.addEventListener('resize', updateLineCoords);
    return () => window.removeEventListener('resize', updateLineCoords);
  }, [showSelector, slots]);

  // Handlers para el selector
  const handleSlotChange = (slotIdx, field, value) => {
    setSlots(prev => {
      const updated = [...prev];
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
      default:
        return [];
    }
  };

  // Buscar vehículo basado en los filtros seleccionados
  const findVehicleId = async (slot) => {
    try {
      const params = new URLSearchParams();
      if (slot.motorizacion) params.append('id_motorizacion', slot.motorizacion);
      if (slot.version) params.append('version', slot.version);
      if (slot.anio) params.append('anio', slot.anio);
      params.append('limit', '1');
      
      const response = await apiClient.get(`/vehicles?${params.toString()}`);
      if (response.data?.data?.vehicles?.length > 0) {
        return response.data.data.vehicles[0].id_vehiculo;
      }
      return null;
    } catch (err) {
      console.error('Error buscando vehículo:', err);
      return null;
    }
  };

  // Manejar comparación desde el selector
  const handleCompareFromSelector = async () => {
    const completeSlots = slots.filter(slot => 
      slot.marca && slot.modelo && slot.generacion && slot.motorizacion
    );

    if (completeSlots.length < 2) {
      alert('Selecciona al menos 2 vehículos para comparar');
      return;
    }

    setLoading(true);
    try {
      const vehicleIdPromises = completeSlots.map(slot => findVehicleId(slot));
      const vehicleIds = await Promise.all(vehicleIdPromises);
      const validIds = vehicleIds.filter(id => id !== null);

      if (validIds.length >= 2) {
        fetchComparisonData(validIds);
      } else {
        setError('No se pudieron encontrar suficientes vehículos con los criterios seleccionados');
        setLoading(false);
      }
    } catch (err) {
      setError('Error al procesar la selección');
      setLoading(false);
    }
  };

  // Calcular cuántos vehículos están seleccionados
  const selectedCount = slots.filter(slot => 
    slot.marca && slot.modelo && slot.generacion && slot.motorizacion
  ).length;

  // Colores del botón según el estado
  let compareBtnColor = '#ccc';
  let compareBtnDisabled = true;
  if (selectedCount === 1) {
    compareBtnColor = '#ff9999';
    compareBtnDisabled = true;
  } else if (selectedCount >= 2) {
    compareBtnColor = 'var(--cherry-red, #D90429)';
    compareBtnDisabled = false;
  }

  // Navegación por secciones
  const sections = [
    { id: 'general', name: 'General', icon: FaCarSide },
    { id: 'motor', name: 'Motor y Rendimiento', icon: FaTachometerAlt },
    { id: 'consumo', name: 'Consumo y Emisiones', icon: FaGasPump },
    { id: 'dimensiones', name: 'Dimensiones', icon: FaRuler },
    { id: 'precio', name: 'Precio', icon: FaEuroSign },
    { id: 'resumen', name: 'Resumen Inteligente', icon: FaChartBar }
  ];

  // Función para hacer scroll a una sección
  const scrollToSection = (sectionId) => {
    const element = sectionRefs[sectionId]?.current;
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Función para reiniciar y volver al selector
  const handleResetComparison = () => {
    setVehicles([]);
    setShowSelector(true);
    setSlots(Array(6).fill().map(() => ({ ...initialSlot })));
  };

  if (loading && !showSelector) return <LoadingSpinner message="Cargando comparación..." />;

  // Renderizar el selector visual
  if (showSelector) {
  const isDesktop = window.innerWidth >= 1200;

  return (
      <div className="comparison-page-modern">
        <div className="comparison-header">
          <BackButton onClick={() => navigate(-1)} />
      <h1 className="page-title">Comparativa de Vehículos</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="selector-container" ref={containerRef}>
          <h2 className="selector-title">Selecciona los vehículos a comparar</h2>
          <p className="selector-subtitle">Elige entre 2 y 6 vehículos para realizar una comparativa detallada</p>

        {isDesktop && (
          <svg
              className="selector-lines"
            width="100%"
              height={containerRef.current ? containerRef.current.offsetHeight : 400}
          >
            {lineCoords.map((coord, idx) => {
              if (!coord) return null;
              const { startX, startY, endX, endY } = coord;
              const slot = slots[idx];
                const isComplete = slot.marca && slot.modelo && slot.generacion && slot.motorizacion;
              const c1Y = startY + 60;
              const c2Y = endY - 60;
              return (
                <path
                  key={idx}
                  d={`M${startX},${startY} C${startX},${c1Y} ${endX},${c2Y} ${endX},${endY}`}
                    stroke={isComplete ? 'var(--cherry-red, #D90429)' : '#ddd'}
                    strokeWidth={3}
                  fill="none"
                  style={{ transition: 'stroke 0.3s' }}
                />
              );
            })}
          </svg>
        )}

          <div className="slots-grid">
          {slots.map((slot, idx) => {
              const isComplete = slot.marca && slot.modelo && slot.generacion && slot.motorizacion;
            return (
              <div
                key={idx}
                ref={el => columnRefs.current[idx] = el}
                  className={`slot-card ${isComplete ? 'complete' : ''}`}
                >
                  <div className="slot-number">{idx + 1}</div>
                  <div className="slot-selects">
                    <select 
                      value={slot.marca} 
                      onChange={e => handleSlotChange(idx, 'marca', e.target.value)}
                      className="slot-select"
                    >
                      <option value="">Marca</option>
                      {getFilteredOptions(slot, 'marca').map(m => (
                        <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
                      ))}
                  </select>

                    <select 
                      value={slot.modelo} 
                      onChange={e => handleSlotChange(idx, 'modelo', e.target.value)}
                      className="slot-select"
                      disabled={!slot.marca}
                    >
                      <option value="">Modelo</option>
                      {getFilteredOptions(slot, 'modelo').map(mo => (
                        <option key={mo.id_modelo} value={mo.id_modelo}>{mo.nombre}</option>
                      ))}
                  </select>

                    <select 
                      value={slot.generacion} 
                      onChange={e => handleSlotChange(idx, 'generacion', e.target.value)}
                      className="slot-select"
                      disabled={!slot.modelo}
                    >
                      <option value="">Generación</option>
                      {getFilteredOptions(slot, 'generacion').map(g => (
                        <option key={g.id_generacion} value={g.id_generacion}>
                          {g.nombre} {g.anio_inicio && `(${g.anio_inicio}-${g.anio_fin || '...'})`}
                        </option>
                      ))}
                  </select>

                    <select 
                      value={slot.motorizacion} 
                      onChange={e => handleSlotChange(idx, 'motorizacion', e.target.value)}
                      className="slot-select"
                      disabled={!slot.generacion}
                    >
                      <option value="">Motorización</option>
                      {getFilteredOptions(slot, 'motorizacion').map(mt => (
                        <option key={mt.id_motorizacion} value={mt.id_motorizacion}>
                          {mt.nombre}
                        </option>
                      ))}
                  </select>
                  </div>
                  
                  {isComplete && (
                    <button 
                      className="slot-clear"
                      onClick={() => handleSlotChange(idx, 'marca', '')}
                      title="Limpiar selección"
                    >
                      <FaTimes />
                    </button>
                  )}
              </div>
            );
          })}
        </div>

          <div className="selector-actions">
            <button
              ref={buttonRef}
              className="compare-button"
              style={{ backgroundColor: compareBtnColor }}
            disabled={compareBtnDisabled}
              onClick={handleCompareFromSelector}
          >
              Comparar {selectedCount > 0 && `(${selectedCount})`}
          </button>
          </div>

          <div className="selector-info">
            <p>💡 <strong>Consejo:</strong> También puedes usar la comparativa rápida desde el catálogo de vehículos, 
            añadiendo coches con el botón de comparar y luego haciendo clic en el icono de comparación en la barra superior.</p>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error en la comparación
  if (error || vehicles.length < 2) {
    return (
      <div className="comparison-page-modern">
        <div className="comparison-header">
          <BackButton onClick={() => navigate(-1)} />
          <h1 className="page-title">Comparativa de Vehículos</h1>
          <div className="header-spacer"></div>
        </div>
        <div className="comparison-error-container">
          <ErrorMessage message={error || 'No hay suficientes vehículos para comparar.'} />
          <button onClick={handleResetComparison} className="reset-button">
            Seleccionar otros vehículos
          </button>
        </div>
      </div>
    );
  }

  // Función auxiliar para renderizar icono de combustible
  const renderFuelIcon = (combustible) => {
    if (!combustible) return 'N/A';
    
    if (combustible === 'Eléctrico') {
      return (
        <React.Fragment>
          <FaBolt style={{ marginRight: '4px' }} />
          {combustible}
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <FaGasPump style={{ marginRight: '4px' }} />
          {combustible}
        </React.Fragment>
      );
    }
  };

  // Renderizar sección General
  const renderGeneralSection = () => (
    <div className="comparison-section" ref={sectionRefs.general} id="general">
      <h2 className="section-title">Información General</h2>
      <div className="vehicles-grid">
        {vehicles.map((vehicle, index) => (
          <div key={vehicle.id_vehiculo} className="vehicle-card" style={{ borderColor: VEHICLE_COLORS[index] }}>
            <Link to={`/vehicles/${vehicle.id_vehiculo}`} className="vehicle-link">
              <img
                src={vehicle.imagen_principal || defaultImage}
                alt={`${vehicle.marca || ''} ${vehicle.modelo || ''}`}
                className="vehicle-image"
                onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
              />
              <h3 className="vehicle-title" style={{ color: VEHICLE_COLORS[index] }}>
                {vehicle.marca || ''} {vehicle.modelo || ''}
              </h3>
              <p className="vehicle-subtitle">
                {vehicle.version || vehicle.generacion || ''} - {vehicle.anio || ''}
              </p>
              <div className="vehicle-badges">
                <span className="badge type-badge">{vehicle.tipo || 'N/A'}</span>
                <span className={`badge fuel-badge ${vehicle.combustible ? vehicle.combustible.toLowerCase() : ''}`}>
                  {renderFuelIcon(vehicle.combustible)}
                </span>
                {vehicle.pegatina_ambiental && (
                  <span className={`badge eco-badge ${vehicle.pegatina_ambiental}`}>
                    {vehicle.pegatina_ambiental}
                  </span>
                )}
              </div>
                   </Link>
          </div>
        ))}
      </div>
    </div>
  );

  // Renderizar comparación detallada
              return (
    <div className="comparison-page-modern">
      <div className="comparison-header">
        <BackButton onClick={() => navigate(-1)} />
        <h1 className="page-title">Comparativa de Vehículos</h1>
        <button onClick={handleResetComparison} className="new-comparison-button">
          Nueva comparación
        </button>
      </div>

      <VehicleLegend vehicles={vehicles} />

      <div className="section-nav-sticky">
        <div className="section-tabs">
          {sections.map(section => {
            const IconComponent = section.icon;
                    return (
              <button
                key={section.id}
                className="section-tab"
                onClick={() => scrollToSection(section.id)}
              >
                <span className="section-tab-icon">
                  <IconComponent />
                </span>
                <span>{section.name}</span>
              </button>
                    );
                  })}
        </div>
      </div>

      <div className="comparison-content-continuous">
        {renderGeneralSection()}
        
        <div className="comparison-section" ref={sectionRefs.motor} id="motor">
          <h2 className="section-title">Motor y Rendimiento</h2>
          <InterleavedComparisonBar vehicles={vehicles} property="potencia" label="Potencia" unit=" CV" higherIsBetter={true} />
          <InterleavedComparisonBar vehicles={vehicles} property="par_motor" label="Par Motor" unit=" Nm" higherIsBetter={true} />
          <InterleavedComparisonBar vehicles={vehicles} property="velocidad_max" label="Velocidad Máxima" unit=" km/h" higherIsBetter={true} />
          <InterleavedComparisonBar vehicles={vehicles} property="aceleracion_0_100" label="Aceleración 0-100 km/h" unit=" s" higherIsBetter={false} />
        </div>

        <div className="comparison-section" ref={sectionRefs.consumo} id="consumo">
          <h2 className="section-title">Consumo y Emisiones</h2>
          
          {/* Consumos */}
          <div className="consumption-subsection">
            <h3 className="subsection-title">Consumos</h3>
            <InterleavedComparisonBar vehicles={vehicles} property="consumo_urbano" label="Consumo Urbano" unit=" L/100km" higherIsBetter={false} />
            <InterleavedComparisonBar vehicles={vehicles} property="consumo_extraurbano" label="Consumo Extraurbano" unit=" L/100km" higherIsBetter={false} />
            <InterleavedComparisonBar vehicles={vehicles} property="consumo_mixto" label="Consumo Mixto" unit=" L/100km" higherIsBetter={false} />
          </div>
          
          {/* Emisiones */}
          <div className="emissions-subsection">
            <h3 className="subsection-title">Emisiones y Eficiencia</h3>
            <InterleavedComparisonBar vehicles={vehicles} property="emisiones" label="Emisiones CO2" unit=" g/km" higherIsBetter={false} />
          </div>
          
          {/* Autonomía */}
          <div className="autonomy-subsection">
            <h3 className="subsection-title">Autonomía Estimada</h3>
            <InterleavedComparisonBar vehicles={vehicles} property="autonomia_calculada" label="Autonomía Estimada" unit=" km" higherIsBetter={true} />
            <div className="autonomy-explanation">
              <p><strong>Nota:</strong> Para vehículos eléctricos se calcula basándose en la capacidad de batería y consumo promedio. 
              Para vehículos de combustión se estima según el tamaño del depósito de combustible y el consumo mixto.</p>
            </div>
          </div>
        </div>

        <div className="comparison-section" ref={sectionRefs.dimensiones} id="dimensiones">
          <h2 className="section-title">Dimensiones</h2>
          <DimensionVisualization vehicles={vehicles} />
        </div>

        <div className="comparison-section" ref={sectionRefs.precio} id="precio">
          <h2 className="section-title">Precio</h2>
          
          {/* Verificar si hay datos de precio */}
          {vehicles.some(v => v.precio_original || v.precio_actual_estimado) ? (
            <>
              <InterleavedComparisonBar vehicles={vehicles} property="precio_original" label="Precio Original" unit=" €" higherIsBetter={false} />
              <InterleavedComparisonBar vehicles={vehicles} property="precio_actual_estimado" label="Precio Actual Estimado" unit=" €" higherIsBetter={false} />
              
              <div className="price-analysis">
                <h3 className="subsection-title">Análisis de Precios</h3>
                <div className="price-insights">
                  {(() => {
                    const priceInsights = [];
                    
                    // Encontrar el más caro y más barato
                    const withPrices = vehicles.filter(v => v.precio_actual_estimado && v.precio_actual_estimado > 0);
                    if (withPrices.length > 1) {
                      const mostExpensive = withPrices.reduce((prev, current) => 
                        (current.precio_actual_estimado > prev.precio_actual_estimado) ? current : prev
                      );
                      const cheapest = withPrices.reduce((prev, current) => 
                        (current.precio_actual_estimado < prev.precio_actual_estimado) ? current : prev
                      );
                      
                      const priceDiff = mostExpensive.precio_actual_estimado - cheapest.precio_actual_estimado;
                      const percentDiff = ((priceDiff / cheapest.precio_actual_estimado) * 100).toFixed(1);
                      
                      priceInsights.push(
                        `El ${mostExpensive.marca} ${mostExpensive.modelo} es ${percentDiff}% más caro que el ${cheapest.marca} ${cheapest.modelo} (diferencia de ${priceDiff.toLocaleString('es-ES')}€).`
                      );
                      
                      // Análisis valor/prestaciones
                      const withPowerAndPrice = vehicles.filter(v => v.precio_actual_estimado > 0 && v.potencia > 0);
                      if (withPowerAndPrice.length > 1) {
                        const bestValueCar = withPowerAndPrice.reduce((prev, current) => {
                          const prevRatio = prev.potencia / prev.precio_actual_estimado * 1000;
                          const currentRatio = current.potencia / current.precio_actual_estimado * 1000;
                          return currentRatio > prevRatio ? current : prev;
                        });
                        
                        priceInsights.push(
                          `El ${bestValueCar.marca} ${bestValueCar.modelo} ofrece la mejor relación potencia/precio con ${(bestValueCar.potencia / bestValueCar.precio_actual_estimado * 1000).toFixed(2)} CV por cada 1000€.`
                        );
                      }
                    }
                    
                    if (priceInsights.length === 0) {
                      priceInsights.push('Los precios varían según las características y posicionamiento de mercado de cada vehículo.');
                    }
                    
                    return priceInsights.map((insight, idx) => (
                      <div key={idx} className="price-insight">
                        <FaStar className="insight-icon" />
                        <span>{insight}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </>
          ) : (
            <div className="no-price-data">
              <p>⚠️ No hay datos de precio disponibles para los vehículos seleccionados.</p>
              <p>Los precios pueden variar según la configuración, año del modelo y disponibilidad en el mercado.</p>
            </div>
          )}
        </div>

        <div className="comparison-section" ref={sectionRefs.resumen} id="resumen">
          <h2 className="section-title">Resumen Inteligente</h2>
          <SmartSummary vehicles={vehicles} />
        </div>
             </div>
             
      {/* Coche animado para volver arriba */}
      <ScrollToTopCar />
    </div>
  );
};

export default ComparisonPage; 