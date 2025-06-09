import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // useParams para ID, useNavigate para redirigir
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { FaSave, FaTimes, FaCar, FaBolt, FaRulerCombined, FaCogs, FaLeaf, FaTachometerAlt, FaImages, FaTrash, FaPlus, FaStopwatch, FaInfoCircle } from 'react-icons/fa'; // Iconos
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import BackButton from '../../components/Common/BackButton';
import './AdminPages.css'; // Estilos Admin

// --- Definiciones Constantes (ENUMs de la BD) ---
const vehicleTypes = ['Sedán','SUV','Deportivo','Hatchback','Coupé','Furgoneta','Urbano','Pick-up','Monovolumen','Cabrio','Familiar','Otro'];
const dgtLabels = ['0','ECO','B','C','Sin etiqueta'];
const tractions = ['Delantera', 'Trasera', 'Total', 'Total Desconectable'];
const gearboxes = ['Manual', 'Automática Convertidor Par', 'Automática CVT', 'Automática Doble Embrague', 'Directa Eléctrico', 'Otra'];

// --- Estado Inicial del Formulario ---
const initialFormData = {
  // Información básica
  anio: '',
  tipo: '',
  version: '',
  pegatina_ambiental: 'Sin etiqueta',
  combustible: '', // Campo que viene de la tabla Motorizacion
  
  // Rendimiento
  potencia: '',
  par_motor: '',
  velocidad_max: '',
  aceleracion_0_100: '',
  distancia_frenado_100_0: '',
  
  // Consumo y emisiones
  consumo_urbano: '',
  consumo_extraurbano: '',
  consumo_mixto: '',
  emisiones: '',
  
  // Eléctrico
  autonomia_electrica: '',
  capacidad_bateria: '',
  tiempo_carga_ac: '',
  potencia_carga_dc: '',
  tiempo_carga_dc_10_80: '',
  
  // Dimensiones
  peso: '',
  num_puertas: '',
  num_plazas: '',
  vol_maletero: '',
  vol_maletero_max: '',
  dimension_largo: '',
  dimension_ancho: '',
  dimension_alto: '',
  distancia_entre_ejes: '',
  
  // Transmisión
  traccion: '',
  caja_cambios: '',
  num_marchas: '',
  
  // Precios y fechas
  precio_original: '',
  precio_actual_estimado: '',
  fecha_lanzamiento: ''
};

// --- Componente del Formulario ---
const AdminVehicleFormPage = () => {
  const { id } = useParams(); // Obtiene el ID de la URL si estamos editando (ej. /admin/vehicles/edit/123)
  const navigate = useNavigate(); // Hook para redirigir después de guardar/cancelar
  const isEditing = Boolean(id); // True si hay un ID en la URL (modo edición)
  const [vehicleData, setVehicleData] = useState(initialFormData); // Estado para los datos del formulario
  const [loading, setLoading] = useState(isEditing); // Cargar si estamos editando
  const [saving, setSaving] = useState(false); // Estado para indicar si se está guardando
  const [error, setError] = useState(null); // Estado para errores de carga o guardado

  // NUEVO: Estados para selects encadenados
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [generaciones, setGeneraciones] = useState([]);
  const [motorizaciones, setMotorizaciones] = useState([]);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [selectedGeneracion, setSelectedGeneracion] = useState('');
  const [selectedMotorizacion, setSelectedMotorizacion] = useState('');

  // Estados para imágenes y tiempos
  const [vehicleImages, setVehicleImages] = useState([]);
  const [vehicleTimes, setVehicleTimes] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Función helper para formatear tiempo de circuito (de 00:MM:SS.ms a MM:SS.ms)
  const formatCircuitTime = (timeString) => {
    if (!timeString) return timeString;
    
    // Si el tiempo tiene el formato 00:MM:SS.ms, convertir a MM:SS.ms
    const timeMatch = timeString.match(/^00:(\d{2}:\d{2}\.\d{1,3})$/);
    if (timeMatch) {
      return timeMatch[1]; // Devolver solo MM:SS.ms
    }
    
    // Si ya está en formato MM:SS.ms o cualquier otro formato, devolverlo tal como está
    return timeString;
  };

  // Lista de circuitos conocidos para autocompletado
  const circuitosConocidos = [
    'Nürburgring Nordschleife',
    'Circuit de la Sarthe (Le Mans)',
    'Silverstone Grand Prix Circuit',
    'Spa-Francorchamps',
    'Monza',
    'Suzuka Circuit',
    'Circuit de Monaco',
    'Brands Hatch',
    'Laguna Seca',
    'Road America',
    'Watkins Glen',
    'Sepang International Circuit',
    'Hockenheimring',
    'Red Bull Ring',
    'Mugello',
    'Imola',
    'Portimão',
    'Barcelona-Catalunya',
    'Hungaroring',
    'Circuit Zandvoort',
    'Donington Park',
    'Oulton Park',
    'Goodwood',
    'Mount Panorama (Bathurst)',
    'Fuji Speedway',
    'Twin Ring Motegi',
    'Daytona International Speedway',
    'Road Atlanta',
    'Virginia International Raceway',
    'Lime Rock Park',
    'Sonoma Raceway',
    'Circuit Paul Ricard',
    'Magny-Cours',
    'Estoril',
    'Jerez',
    'Valencia',
    'Jarama',
    'Ascari Race Resort'
  ];

  // Lista de neumáticos deportivos conocidos para autocompletado
  const neumaticosConocidos = [
    'Michelin Pilot Sport 4S',
    'Michelin Pilot Sport Cup 2',
    'Michelin Pilot Sport Cup 2 R',
    'Michelin Pilot Super Sport',
    'Pirelli P Zero',
    'Pirelli P Zero Corsa',
    'Pirelli P Zero Trofeo R',
    'Continental ContiSportContact 6',
    'Continental ContiForceContact',
    'Bridgestone Potenza RE-71R',
    'Bridgestone Potenza S007A',
    'Bridgestone Potenza RE050A',
    'Yokohama Advan A052',
    'Yokohama Advan Neova AD08R',
    'Toyo Proxes R888R',
    'Toyo Proxes Sport',
    'Hankook Ventus RS-4',
    'Dunlop Sport Maxx Race 2',
    'Nitto NT05',
    'Federal 595 RS-RR',
    'Falken Azenis RT615K+',
    'GT Radial Champiro SX2',
    'Kumho Ecsta V720',
    'BFGoodrich g-Force Rival S 1.5'
  ];

  // Función para cargar imágenes del vehículo
  const fetchVehicleImages = useCallback(async () => {
    if (!isEditing) return;
    
    setLoadingImages(true);
    try {
      const response = await apiClient.get(`/images/vehicle/${id}`);
      setVehicleImages(response.data.data || []);
    } catch (err) {
      console.error("Error fetching vehicle images:", err.response?.data || err.message);
      setVehicleImages([]);
    } finally {
      setLoadingImages(false);
    }
  }, [id, isEditing]);

  // Función para cargar tiempos de circuito del vehículo
  const fetchVehicleTimes = useCallback(async () => {
    if (!isEditing) return;
    
    setLoadingTimes(true);
    try {
      const response = await apiClient.get(`/times/vehicle/${id}`);
      setVehicleTimes(response.data.data || []);
    } catch (err) {
      console.error("Error fetching vehicle times:", err.response?.data || err.message);
      setVehicleTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  }, [id, isEditing]);

  // --- Carga de Datos (si estamos editando) ---
  const fetchVehicleData = useCallback(async () => {
    if (!isEditing) return; // No hacer nada si es un vehículo nuevo

    setLoading(true);
    setError(null);
    try {
      // Cargar datos principales del vehículo
      const response = await apiClient.get(`/vehicles/${id}`);
      const fetchedData = response.data.data;

      // Pre-procesar datos para el formulario:
      // 1. Formatear fecha_lanzamiento a YYYY-MM-DD para input type="date"
      if (fetchedData.fecha_lanzamiento) {
            try {
                const fechaLanzamiento = format(parseISO(fetchedData.fecha_lanzamiento), 'yyyy-MM-dd');
                fetchedData.fecha_lanzamiento = fechaLanzamiento;
                
                // Sincronizar el año con la fecha de lanzamiento si no hay año o si es inconsistente
                const yearFromDate = new Date(fechaLanzamiento).getFullYear();
                if (!fetchedData.anio || Math.abs(fetchedData.anio - yearFromDate) > 1) {
                  fetchedData.anio = yearFromDate;
                }
            } catch {
                 fetchedData.fecha_lanzamiento = ''; // Poner vacío si la fecha es inválida
            }
      } else {
          fetchedData.fecha_lanzamiento = '';
      }
      
      // 2. Convertir valores NULL de la BD a strings vacíos para los inputs controlados
        const processedData = { ...initialFormData }; // Empezar con la estructura inicial
        for (const key in fetchedData) {
            if (Object.prototype.hasOwnProperty.call(initialFormData, key)) { // Asegurar que el campo existe en nuestro estado
                 processedData[key] = fetchedData[key] === null ? '' : fetchedData[key];
            }
        }

        // Mapear campos específicos del backend que no están en initialFormData
        processedData.marca_nombre = fetchedData.marca_nombre || '';
        processedData.modelo_nombre = fetchedData.modelo_nombre || '';
        processedData.generacion_nombre = fetchedData.generacion_nombre || '';
        processedData.motorizacion_nombre = fetchedData.motorizacion_nombre || '';
        processedData.combustible = fetchedData.combustible || '';

      setVehicleData(processedData); // Actualizar el estado del formulario

    } catch (err) {
      setError(`Error al cargar los datos del vehículo (ID: ${id}). Es posible que no exista.`);
      console.error("Error fetching vehicle data for edit:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  // useEffect para cargar datos cuando el componente se monta (solo en modo edición)
  useEffect(() => {
    if (isEditing) {
      fetchVehicleData();
      fetchVehicleImages();
      fetchVehicleTimes();
    }
  }, [id, isEditing, fetchVehicleData, fetchVehicleImages, fetchVehicleTimes]);

  // Cargar opciones desde la API
  useEffect(() => {
    apiClient.get('/vehicles/options').then(res => {
      setMarcas(res.data.marcas);
      setModelos(res.data.modelos);
      setGeneraciones(res.data.generaciones);
      setMotorizaciones(res.data.motorizaciones);
    });
  }, []);

  // Efecto para establecer los valores de los selects cuando se cargan los datos del vehículo
  useEffect(() => {
    if (isEditing && vehicleData.id_motorizacion && motorizaciones.length > 0) {
      // En modo edición, establecer los valores directamente desde los datos del vehículo
      setSelectedMotorizacion(vehicleData.id_motorizacion?.toString() || '');
      
      // Los nombres ya vienen en vehicleData, no necesitamos buscarlos
      // vehicleData contiene: marca_nombre, modelo_nombre, generacion_nombre, motorizacion_nombre
    }
  }, [vehicleData.id_motorizacion, motorizaciones, isEditing]);

  // Filtrar modelos, generaciones y motorizaciones según selección
  const modelosFiltrados = modelos.filter(m => m.id_marca === parseInt(selectedMarca));
  const generacionesFiltradas = generaciones.filter(g => g.id_modelo === parseInt(selectedModelo));
  const motorizacionesFiltradas = motorizaciones.filter(mt => mt.id_generacion === parseInt(selectedGeneracion));

  // Manejadores de cambio
  const handleMarcaChange = (e) => {
    setSelectedMarca(e.target.value);
    setSelectedModelo('');
    setSelectedGeneracion('');
    setSelectedMotorizacion('');
  };
  const handleModeloChange = (e) => {
    setSelectedModelo(e.target.value);
    setSelectedGeneracion('');
    setSelectedMotorizacion('');
  };
  const handleGeneracionChange = (e) => {
    setSelectedGeneracion(e.target.value);
    setSelectedMotorizacion('');
  };
  const handleMotorizacionChange = (e) => {
    setSelectedMotorizacion(e.target.value);
  };

  // --- Manejadores de Formulario ---

  // Manejador genérico para cambios en los inputs/selects
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Sincronizar año con fecha de lanzamiento
      if (name === 'fecha_lanzamiento' && value) {
        // Si se cambia la fecha, extraer el año automáticamente
        const year = new Date(value).getFullYear();
        newData.anio = year.toString();
      } else if (name === 'anio' && value) {
        // Si se cambia el año manualmente y no hay fecha específica, crear una fecha genérica
        if (!newData.fecha_lanzamiento) {
          newData.fecha_lanzamiento = `${value}-01-01`;
        }
      }
      
      return newData;
    });
  };

  // Manejador para enviar el formulario (Crear o Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir envío HTML
    setSaving(true); // Indicar inicio de guardado
    setError(null); // Limpiar errores previos

    // Preparar datos para enviar a la API:
    // Convertir strings vacíos de campos numéricos/fecha a NULL
    const dataToSend = {
      // En modo creación incluir id_motorizacion, en edición NO
      ...(isEditing ? {} : { id_motorizacion: selectedMotorizacion }),
      
      anio: vehicleData.anio,
      tipo: vehicleData.tipo,
      version: vehicleData.version || null,
      pegatina_ambiental: vehicleData.pegatina_ambiental,
      
      // Rendimiento
      velocidad_max: vehicleData.velocidad_max || null,
      aceleracion_0_100: vehicleData.aceleracion_0_100 || null,
      distancia_frenado_100_0: vehicleData.distancia_frenado_100_0 || null,
      
      // Consumo y emisiones
      consumo_urbano: vehicleData.consumo_urbano || null,
      consumo_extraurbano: vehicleData.consumo_extraurbano || null,
      consumo_mixto: vehicleData.consumo_mixto || null,
      emisiones: vehicleData.emisiones || null,
      
      // Eléctrico
      autonomia_electrica: vehicleData.autonomia_electrica || null,
      capacidad_bateria: vehicleData.capacidad_bateria || null,
      tiempo_carga_ac: vehicleData.tiempo_carga_ac || null,
      potencia_carga_dc: vehicleData.potencia_carga_dc || null,
      tiempo_carga_dc_10_80: vehicleData.tiempo_carga_dc_10_80 || null,
      
      // Dimensiones
      peso: vehicleData.peso || null,
      num_puertas: vehicleData.num_puertas || null,
      num_plazas: vehicleData.num_plazas || null,
      vol_maletero: vehicleData.vol_maletero || null,
      vol_maletero_max: vehicleData.vol_maletero_max || null,
      dimension_largo: vehicleData.dimension_largo || null,
      dimension_ancho: vehicleData.dimension_ancho || null,
      dimension_alto: vehicleData.dimension_alto || null,
      distancia_entre_ejes: vehicleData.distancia_entre_ejes || null,
      
      // Transmisión
      traccion: vehicleData.traccion || null,
      caja_cambios: vehicleData.caja_cambios || null,
      num_marchas: vehicleData.num_marchas || null,
      
      // Precios y fechas
      precio_original: vehicleData.precio_original || null,
      precio_actual_estimado: vehicleData.precio_actual_estimado || null,
      fecha_lanzamiento: vehicleData.fecha_lanzamiento || null
    };

    try {
      if (isEditing) {
        // --- Modo Edición: Llamada PUT ---
        await apiClient.put(`/vehicles/${id}`, dataToSend);
        toast.success('Vehículo actualizado correctamente.');
      } else {
        // --- Modo Creación: Llamada POST ---
        await apiClient.post('/vehicles', dataToSend);
        toast.success('Vehículo creado correctamente.');
      }
      // Redirigir a la lista de vehículos de admin tras éxito
      navigate('/admin/vehicles');

    } catch (err) {
      // Manejar errores de la API (incluyendo validación del backend)
      let errorMsg = `Error al ${isEditing ? 'actualizar' : 'crear'} el vehículo.`;
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          // Si hay errores de validación específicos del backend, mostrarlos
          errorMsg += " Detalles: " + err.response.data.errors.map(e => e.msg || e.param).join(', ');
      } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message; // Usar mensaje del backend si existe
      }
      setError(errorMsg);
      toast.error(errorMsg); // Notificación de error
      console.error("Error saving vehicle:", err.response?.data || err.message);
    } finally {
      setSaving(false); // Finalizar estado de guardado
    }
  };

  // --- Funciones para gestión de imágenes ---
  const handleAddImage = async () => {
    const ruta = document.getElementById('new_image_ruta').value.trim();
    const descripcion = document.getElementById('new_image_desc').value.trim();
    const orden = parseInt(document.getElementById('new_image_orden').value) || 0;

    if (!ruta) {
      toast.error('La ruta de la imagen es obligatoria');
      return;
    }

    try {
      setSaving(true);
      await apiClient.post(`/images/vehicle/${id}`, {
        ruta_local: ruta,
        descripcion: descripcion || null,
        orden: orden
      });
      
      toast.success('Imagen añadida correctamente');
      
      // Limpiar formulario
      document.getElementById('new_image_ruta').value = '';
      document.getElementById('new_image_desc').value = '';
      document.getElementById('new_image_orden').value = '0';
      
      // Recargar imágenes
      await fetchVehicleImages();
    } catch (err) {
      toast.error('Error al añadir la imagen');
      console.error('Error adding image:', err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (idImagen) => {
    if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) return;

    try {
      setSaving(true);
      await apiClient.delete(`/images/${idImagen}`);
      toast.success('Imagen eliminada correctamente');
      await fetchVehicleImages();
    } catch (err) {
      toast.error('Error al eliminar la imagen');
      console.error('Error deleting image:', err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Funciones para gestión de tiempos ---
  const handleAddTime = async () => {
    const circuito = document.getElementById('new_time_circuito').value.trim();
    const tiempo_vuelta_input = document.getElementById('new_time_vuelta').value.trim();
    const condiciones = document.getElementById('new_time_condiciones').value || null;
    const fecha_record = document.getElementById('new_time_fecha').value || null;
    const piloto = document.getElementById('new_time_piloto').value.trim() || null;
    const neumaticos = document.getElementById('new_time_neumaticos').value.trim() || null;

    // Validaciones del frontend
    if (!circuito || !tiempo_vuelta_input) {
      toast.error('El circuito y el tiempo de vuelta son obligatorios');
      return;
    }

    // Validar formato del tiempo (MM:SS.ms - ej: 09:14.930)
    const timeRegex = /^\d{2}:\d{2}\.\d{1,3}$/;
    if (!timeRegex.test(tiempo_vuelta_input)) {
      toast.error('Formato de tiempo inválido. Use MM:SS.ms (ej: 09:14.930)');
      return;
    }

    // Validar longitud del circuito
    if (circuito.length < 3 || circuito.length > 100) {
      toast.error('El nombre del circuito debe tener entre 3 y 100 caracteres');
      return;
    }

    // Convertir MM:SS.ms a 00:MM:SS.ms para compatibilidad con MySQL TIME
    // Ejemplo: "09:14.930" -> "00:09:14.930"
    const tiempo_vuelta = `00:${tiempo_vuelta_input}`;

    try {
      setSaving(true);
      const timeData = {
        circuito,
        tiempo_vuelta,
        condiciones,
        fecha_record,
        piloto,
        neumaticos
      };

      await apiClient.post(`/times/vehicle/${id}`, timeData);
      
      toast.success('Tiempo añadido correctamente');
      
      // Limpiar formulario
      document.getElementById('new_time_circuito').value = '';
      document.getElementById('new_time_vuelta').value = '';
      document.getElementById('new_time_condiciones').value = '';
      document.getElementById('new_time_fecha').value = '';
      document.getElementById('new_time_piloto').value = '';
      document.getElementById('new_time_neumaticos').value = '';
      
      // Recargar tiempos
      await fetchVehicleTimes();
    } catch (err) {
      let errorMsg = 'Error al añadir el tiempo';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Mostrar errores específicos de validación del backend
        errorMsg += ': ' + err.response.data.errors.map(e => e.msg || e.message).join(', ');
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      toast.error(errorMsg);
      console.error('Error adding time:', err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTime = async (idTiempo) => {
    if (!window.confirm('¿Estás seguro de eliminar este tiempo?')) return;

    try {
      setSaving(true);
      await apiClient.delete(`/times/${idTiempo}`);
      toast.success('Tiempo eliminado correctamente');
      await fetchVehicleTimes();
    } catch (err) {
      toast.error('Error al eliminar el tiempo');
      console.error('Error deleting time:', err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Renderizado ---
  if (loading) return <LoadingSpinner message="Cargando datos del formulario..." />;
  // No mostrar error global aquí, se muestra dentro del formulario

  return (
    <div className="container admin-page">
       {/* Enlace para volver a la lista */}
       <BackButton goBack="/admin/vehicles" text="Volver a la lista de vehículos" />

      <h1 className="page-title">{isEditing ? 'Editar Vehículo' : 'Añadir Nuevo Vehículo'}</h1>

      {/* Formulario principal */}
      <form onSubmit={handleSubmit} className="admin-form card">
         {/* Mostrar error de carga/guardado aquí */}
         {error && <ErrorMessage message={error} />}

         {/* --- Sección Información General --- */}
         <section className='form-section'>
            <h2 className='form-section-title'><FaCar /> Información General</h2>
            <div className="form-grid">
                {/* Campos: Marca(*), Modelo(*), Version, Año(*), Tipo(*), Combustible(Solo lectura - viene de la motorización), Etiqueta, Precio Orig, Precio Est, Fecha Lanz. */}
                
                {isEditing ? (
                    // MODO EDICIÓN: Campos de solo lectura
                    <>
                        <div className="form-group">
                            <label htmlFor="marca_readonly">Marca</label>
                            <input 
                                type="text" 
                                id="marca_readonly" 
                                value={vehicleData.marca_nombre || ''} 
                                readOnly 
                                disabled 
                                className="form-control-plaintext"
                                title="Campo de solo lectura - Para cambiar la marca debes crear un nuevo vehículo"
                            />
                            <small className="form-text text-muted">📍 Campo de solo lectura en modo edición</small>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="modelo_readonly">Modelo</label>
                            <input 
                                type="text" 
                                id="modelo_readonly" 
                                value={vehicleData.modelo_nombre || ''} 
                                readOnly 
                                disabled 
                                className="form-control-plaintext"
                                title="Campo de solo lectura - Para cambiar el modelo debes crear un nuevo vehículo"
                            />
                            <small className="form-text text-muted">📍 Campo de solo lectura en modo edición</small>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="generacion_readonly">Generación</label>
                            <input 
                                type="text" 
                                id="generacion_readonly" 
                                value={vehicleData.generacion_nombre || ''} 
                                readOnly 
                                disabled 
                                className="form-control-plaintext"
                                title="Campo de solo lectura - Para cambiar la generación debes crear un nuevo vehículo"
                            />
                            <small className="form-text text-muted">📍 Campo de solo lectura en modo edición</small>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="motorizacion_readonly">Motorización</label>
                            <input 
                                type="text" 
                                id="motorizacion_readonly" 
                                value={vehicleData.motorizacion_nombre || ''} 
                                readOnly 
                                disabled 
                                className="form-control-plaintext"
                                title="Campo de solo lectura - Para cambiar la motorización debes crear un nuevo vehículo"
                            />
                            <small className="form-text text-muted">📍 Campo de solo lectura en modo edición</small>
                        </div>
                    </>
                ) : (
                    // MODO CREACIÓN: Selectores jerárquicos
                    <>
                        <div className="form-group">
                            <label htmlFor="marca">Marca (*)</label>
                            <select id="marca" name="marca" value={selectedMarca} onChange={handleMarcaChange} required disabled={saving}>
                                <option value="">-- Selecciona --</option>
                                {marcas.map(m => <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>)}
                            </select>
                        </div>
                        {selectedMarca && (
                            <div className="form-group">
                                <label htmlFor="modelo">Modelo (*)</label>
                                <select id="modelo" name="modelo" value={selectedModelo} onChange={handleModeloChange} required disabled={saving}>
                                    <option value="">-- Selecciona --</option>
                                    {modelosFiltrados.map(mo => <option key={mo.id_modelo} value={mo.id_modelo}>{mo.nombre}</option>)}
                                </select>
                            </div>
                        )}
                        {selectedModelo && (
                            <div className="form-group">
                                <label htmlFor="generacion">Generación</label>
                                <select id="generacion" name="generacion" value={selectedGeneracion} onChange={handleGeneracionChange} disabled={saving}>
                                    <option value="">-- Selecciona --</option>
                                    {generacionesFiltradas.map(g => <option key={g.id_generacion} value={g.id_generacion}>{g.nombre}</option>)}
                                </select>
                            </div>
                        )}
                        {selectedGeneracion && (
                            <div className="form-group">
                                <label htmlFor="motorizacion">Motorización (*)</label>
                                <select id="motorizacion" name="motorizacion" value={selectedMotorizacion} onChange={handleMotorizacionChange} required disabled={saving}>
                                    <option value="">-- Selecciona --</option>
                                    {motorizacionesFiltradas.map(mt => <option key={mt.id_motorizacion} value={mt.id_motorizacion}>{mt.nombre} ({mt.codigo_motor})</option>)}
                                </select>
                            </div>
                        )}
                    </>
                )}
                
                 {/* Version */}
                <div className="form-group">
                    <label htmlFor="version">Versión</label>
                    <input type="text" id="version" name="version" value={vehicleData.version || ''} onChange={handleInputChange} maxLength="100" disabled={saving}/>
                </div>
                 {/* Año de Lanzamiento (*) */}
                <div className="form-group">
                     <label htmlFor="anio">Año de Lanzamiento (*)</label>
                     <input type="number" id="anio" name="anio" value={vehicleData.anio || ''} onChange={handleInputChange} required min="1886" max={new Date().getFullYear() + 2} step="1" disabled={saving} title="Se sincroniza automáticamente con la fecha de lanzamiento"/>
                </div>
                  {/* Tipo (*) */}
                 <div className="form-group">
                     <label htmlFor="tipo">Tipo (*)</label>
                     <select id="tipo" name="tipo" value={vehicleData.tipo || ''} onChange={handleInputChange} required disabled={saving}>
                         <option value="">-- Selecciona --</option>
                         {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                 </div>
                 {/* Combustible (Solo lectura - viene de la motorización) */}
                 <div className="form-group">
                     <label htmlFor="combustible">Combustible (*)</label>
                     <input 
                       type="text" 
                       id="combustible" 
                       name="combustible" 
                       value={vehicleData.combustible || ''} 
                       readOnly 
                       disabled 
                       className="form-control-plaintext"
                       title="El combustible se define en la motorización seleccionada"
                     />
                     <small className="form-text text-muted">ℹ️ Se define automáticamente por la motorización</small>
                 </div>
                  {/* Etiqueta DGT */}
                  <div className="form-group">
                      <label htmlFor="pegatina_ambiental">Etiqueta DGT</label>
                      <select id="pegatina_ambiental" name="pegatina_ambiental" value={vehicleData.pegatina_ambiental || 'Sin etiqueta'} onChange={handleInputChange} disabled={saving}>
                          {dgtLabels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                  </div>
                   {/* Precio Original */}
                   <div className="form-group">
                       <label htmlFor="precio_original">Precio Original (€)</label>
                       <input type="number" step="0.01" id="precio_original" name="precio_original" value={vehicleData.precio_original || ''} onChange={handleInputChange} min="0" disabled={saving}/>
                   </div>
                    {/* Precio Estimado */}
                   <div className="form-group">
                       <label htmlFor="precio_actual_estimado">Precio Actual Estimado (€)</label>
                       <input type="number" step="0.01" id="precio_actual_estimado" name="precio_actual_estimado" value={vehicleData.precio_actual_estimado || ''} onChange={handleInputChange} min="0" disabled={saving}/>
                   </div>
                    {/* Fecha de Lanzamiento Específica */}
                   <div className="form-group">
                        <label htmlFor="fecha_lanzamiento">Fecha de Lanzamiento Específica</label>
                        <input type="date" id="fecha_lanzamiento" name="fecha_lanzamiento" value={vehicleData.fecha_lanzamiento || ''} onChange={handleInputChange} disabled={saving} title="Opcional: Si se especifica, el año se actualizará automáticamente" />
                        <small className="form-text text-muted">💡 El año y la fecha se sincronizan automáticamente</small>
                   </div>
            </div>
         </section>

         {/* --- Sección Rendimiento --- */}
         <section className='form-section'>
            <h2 className='form-section-title'><FaTachometerAlt /> Rendimiento</h2>
            <div className="form-grid">
                {/* Campos: Potencia, Par, VelMax, Acel, Frenada */}
                 <div className="form-group">
                     <label htmlFor="potencia">Potencia (CV)</label>
                     <input type="number" id="potencia" name="potencia" value={vehicleData.potencia || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                 </div>
                 <div className="form-group">
                      <label htmlFor="par_motor">Par Motor (Nm)</label>
                      <input type="number" id="par_motor" name="par_motor" value={vehicleData.par_motor || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                 </div>
                 <div className="form-group">
                     <label htmlFor="velocidad_max">Velocidad Máx. (km/h)</label>
                     <input type="number" id="velocidad_max" name="velocidad_max" value={vehicleData.velocidad_max || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                </div>
                <div className="form-group">
                     <label htmlFor="aceleracion_0_100">Aceleración 0-100 (s)</label>
                     <input type="number" step="0.1" id="aceleracion_0_100" name="aceleracion_0_100" value={vehicleData.aceleracion_0_100 || ''} onChange={handleInputChange} min="0" disabled={saving}/>
                </div>
                 <div className="form-group">
                      <label htmlFor="distancia_frenado_100_0">Frenada 100-0 (m)</label>
                      <input type="number" step="0.1" id="distancia_frenado_100_0" name="distancia_frenado_100_0" value={vehicleData.distancia_frenado_100_0 || ''} onChange={handleInputChange} min="0" disabled={saving}/>
                 </div>
            </div>
         </section>

         {/* --- Sección Consumo y Emisiones --- */}
          <section className='form-section'>
              <h2 className='form-section-title'><FaLeaf /> Consumo y Emisiones</h2>
              <div className="form-grid">
                  {/* Campos: Consumos, Emisiones */}
                  <div className="form-group">
                       <label htmlFor="consumo_urbano">Consumo Urbano (l ó kWh/100km)</label>
                       <input type="number" step="0.1" id="consumo_urbano" name="consumo_urbano" value={vehicleData.consumo_urbano || ''} onChange={handleInputChange} min="0" disabled={saving}/>
                  </div>
                   <div className="form-group">
                        <label htmlFor="consumo_extraurbano">Consumo Extraurbano (l ó kWh/100km)</label>
                        <input type="number" step="0.1" id="consumo_extraurbano" name="consumo_extraurbano" value={vehicleData.consumo_extraurbano || ''} onChange={handleInputChange} min="0" disabled={saving}/>
                   </div>
                   <div className="form-group">
                         <label htmlFor="consumo_mixto">Consumo Mixto (l ó kWh/100km)</label>
                         <input type="number" step="0.1" id="consumo_mixto" name="consumo_mixto" value={vehicleData.consumo_mixto || ''} onChange={handleInputChange} min="0" disabled={saving}/>
                    </div>
                    <div className="form-group">
                         <label htmlFor="emisiones">Emisiones CO2 (g/km)</label>
                         <input type="number" id="emisiones" name="emisiones" value={vehicleData.emisiones || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                    </div>
              </div>
          </section>

         {/* --- Sección Eléctrico / Híbrido --- */}
         {/* Mostrar solo si el combustible es relevante */}
         {(vehicleData.combustible === 'Eléctrico' || vehicleData.combustible === 'Híbrido Enchufable') && (
                <section className='form-section'>
                    <h2 className='form-section-title'><FaBolt /> Eléctrico / Híbrido</h2>
                    <div className="form-grid">
                        {/* Campos: Autonomia, Batería, Tiempos carga, Potencia DC */}
                        <div className="form-group">
                             <label htmlFor="autonomia_electrica">Autonomía Eléctrica (km)</label>
                             <input type="number" id="autonomia_electrica" name="autonomia_electrica" value={vehicleData.autonomia_electrica || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                        </div>
                         <div className="form-group">
                              <label htmlFor="capacidad_bateria">Capacidad Batería (kWh)</label>
                              <input type="number" step="0.1" id="capacidad_bateria" name="capacidad_bateria" value={vehicleData.capacidad_bateria || ''} onChange={handleInputChange} min="0" disabled={saving}/>
                         </div>
                         <div className="form-group">
                              <label htmlFor="tiempo_carga_ac">Tiempo Carga AC (h)</label>
                              <input type="number" step="0.1" id="tiempo_carga_ac" name="tiempo_carga_ac" value={vehicleData.tiempo_carga_ac || ''} onChange={handleInputChange} min="0" disabled={saving}/>
                         </div>
                          <div className="form-group">
                               <label htmlFor="potencia_carga_dc">Potencia Máx. DC (kW)</label>
                               <input type="number" id="potencia_carga_dc" name="potencia_carga_dc" value={vehicleData.potencia_carga_dc || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                          </div>
                           <div className="form-group">
                                <label htmlFor="tiempo_carga_dc_10_80">Tiempo Carga DC 10-80% (min)</label>
                                <input type="number" id="tiempo_carga_dc_10_80" name="tiempo_carga_dc_10_80" value={vehicleData.tiempo_carga_dc_10_80 || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                           </div>
                    </div>
                </section>
           )}

         {/* --- Sección Dimensiones y Capacidad --- */}
         <section className='form-section'>
             <h2 className='form-section-title'><FaRulerCombined /> Dimensiones y Capacidad</h2>
              <div className="form-grid">
                 {/* Campos: Largo, Ancho, Alto, Ejes, Peso, Puertas, Plazas, Maletero, Maletero Max */}
                 <div className="form-group">
                     <label htmlFor="dimension_largo">Largo (mm)</label>
                     <input type="number" id="dimension_largo" name="dimension_largo" value={vehicleData.dimension_largo || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                </div>
                <div className="form-group">
                      <label htmlFor="dimension_ancho">Ancho (mm)</label>
                      <input type="number" id="dimension_ancho" name="dimension_ancho" value={vehicleData.dimension_ancho || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                 </div>
                  <div className="form-group">
                       <label htmlFor="dimension_alto">Alto (mm)</label>
                       <input type="number" id="dimension_alto" name="dimension_alto" value={vehicleData.dimension_alto || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                  </div>
                   <div className="form-group">
                        <label htmlFor="distancia_entre_ejes">Distancia Ejes (mm)</label>
                        <input type="number" id="distancia_entre_ejes" name="distancia_entre_ejes" value={vehicleData.distancia_entre_ejes || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                   </div>
                    <div className="form-group">
                         <label htmlFor="peso">Peso (kg)</label>
                         <input type="number" id="peso" name="peso" value={vehicleData.peso || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                    </div>
                     <div className="form-group">
                          <label htmlFor="num_puertas">Nº Puertas</label>
                          <input type="number" id="num_puertas" name="num_puertas" value={vehicleData.num_puertas || ''} onChange={handleInputChange} min="0" max="10" step="1" disabled={saving}/>
                     </div>
                      <div className="form-group">
                           <label htmlFor="num_plazas">Nº Plazas</label>
                           <input type="number" id="num_plazas" name="num_plazas" value={vehicleData.num_plazas || ''} onChange={handleInputChange} min="1" max="15" step="1" disabled={saving}/>
                      </div>
                       <div className="form-group">
                            <label htmlFor="vol_maletero">Maletero (l)</label>
                            <input type="number" id="vol_maletero" name="vol_maletero" value={vehicleData.vol_maletero || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                       </div>
                        <div className="form-group">
                             <label htmlFor="vol_maletero_max">Maletero Máx. (l)</label>
                             <input type="number" id="vol_maletero_max" name="vol_maletero_max" value={vehicleData.vol_maletero_max || ''} onChange={handleInputChange} min="0" step="1" disabled={saving}/>
                        </div>
              </div>
         </section>

          {/* --- Sección Transmisión --- */}
          <section className='form-section'>
              <h2 className='form-section-title'><FaCogs /> Transmisión</h2>
               <div className="form-grid">
                   {/* Campos: Tracción, Caja, Marchas */}
                   <div className="form-group">
                       <label htmlFor="traccion">Tracción</label>
                       <select id="traccion" name="traccion" value={vehicleData.traccion || ''} onChange={handleInputChange} disabled={saving}>
                           <option value="">-- Selecciona --</option>
                           {tractions.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                   </div>
                   <div className="form-group">
                        <label htmlFor="caja_cambios">Caja de Cambios</label>
                        <select id="caja_cambios" name="caja_cambios" value={vehicleData.caja_cambios || ''} onChange={handleInputChange} disabled={saving}>
                            <option value="">-- Selecciona --</option>
                            {gearboxes.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                   </div>
                    <div className="form-group">
                         <label htmlFor="num_marchas">Nº Marchas</label>
                         <input type="number" id="num_marchas" name="num_marchas" value={vehicleData.num_marchas || ''} onChange={handleInputChange} min="0" max="12" step="1" disabled={saving}/>
                    </div>
               </div>
          </section>

         {/* --- Sección Imágenes (solo en modo edición) --- */}
         {isEditing && (
           <section className='form-section'>
             <h2 className='form-section-title'><FaImages /> Imágenes del Vehículo</h2>
             {loadingImages ? (
               <p>Cargando imágenes...</p>
             ) : (
               <div className="images-management">
                 {vehicleImages.length > 0 ? (
                   <div className="images-grid">
                     {vehicleImages.map(img => (
                       <div key={img.id_imagen} className="image-item">
                         <img 
                           src={`${process.env.REACT_APP_API_URL.replace('/api', '')}/api/images/vehicles/${img.ruta_local}`} 
                           alt={img.descripcion || 'Imagen del vehículo'}
                           className="vehicle-image-thumb"
                         />
                         <div className="image-info">
                           <p><strong>Descripción:</strong> {img.descripcion || 'Sin descripción'}</p>
                           <p><strong>Orden:</strong> {img.orden}</p>
                           <button 
                             type="button" 
                             className="btn btn-danger btn-sm"
                             onClick={() => handleDeleteImage(img.id_imagen)}
                             disabled={saving}
                           >
                             <FaTrash /> Eliminar
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-muted">No hay imágenes registradas para este vehículo.</p>
                 )}
                 
                 <div className="add-image-section">
                   <h4>Añadir Nueva Imagen</h4>
                   <div className="form-grid">
                     <div className="form-group">
                       <label htmlFor="new_image_ruta">Ruta de Imagen</label>
                       <input 
                         type="text" 
                         id="new_image_ruta" 
                         placeholder="ej: golf_mk2_lateral.jpg"
                         className="form-control"
                       />
                     </div>
                     <div className="form-group">
                       <label htmlFor="new_image_desc">Descripción</label>
                       <input 
                         type="text" 
                         id="new_image_desc" 
                         placeholder="ej: Vista lateral"
                         className="form-control"
                       />
                     </div>
                     <div className="form-group">
                       <label htmlFor="new_image_orden">Orden</label>
                       <input 
                         type="number" 
                         id="new_image_orden" 
                         min="0" 
                         max="99"
                         defaultValue="0"
                         className="form-control"
                       />
                     </div>
                   </div>
                   <button 
                     type="button" 
                     className="btn btn-success"
                     onClick={handleAddImage}
                     disabled={saving}
                   >
                     <FaPlus /> Añadir Imagen
                   </button>
                 </div>
               </div>
             )}
           </section>
         )}

         {/* --- Sección Tiempos de Circuito (solo en modo edición) --- */}
         {isEditing && (
           <section className='form-section'>
             <h2 className='form-section-title'><FaStopwatch /> Tiempos de Circuito</h2>
             {loadingTimes ? (
               <p>Cargando tiempos...</p>
             ) : (
               <div className="times-management">
                 {vehicleTimes.length > 0 ? (
                   <div className="times-table">
                     <table className="table table-striped">
                       <thead>
                         <tr>
                           <th>Circuito</th>
                           <th>Tiempo</th>
                           <th>Condiciones</th>
                           <th>Fecha Record</th>
                           <th>Piloto</th>
                           <th>Neumáticos</th>
                           <th>Acciones</th>
                         </tr>
                       </thead>
                       <tbody>
                         {vehicleTimes.map(time => (
                           <tr key={time.id_tiempo}>
                             <td>{time.circuito}</td>
                             <td><strong>{formatCircuitTime(time.tiempo_vuelta)}</strong></td>
                             <td>{time.condiciones || '-'}</td>
                             <td>{time.fecha_record ? format(parseISO(time.fecha_record), 'dd/MM/yyyy') : '-'}</td>
                             <td>{time.piloto || 'Desconocido'}</td>
                             <td>{time.neumaticos || '-'}</td>
                             <td>
                               <button 
                                 type="button" 
                                 className="btn btn-danger btn-sm"
                                 onClick={() => handleDeleteTime(time.id_tiempo)}
                                 disabled={saving}
                               >
                                 <FaTrash />
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 ) : (
                   <p className="text-muted">No hay tiempos de circuito registrados para este vehículo.</p>
                 )}
                 
                 <div className="add-time-section">
                   <h4>Añadir Nuevo Tiempo</h4>
                   <p className="form-help-text">
                     <FaInfoCircle /> Esta sección es opcional. Puedes agregar tiempos de circuito para comparar el rendimiento del vehículo.
                   </p>
                   <div className="form-grid">
                     <div className="form-group">
                       <label htmlFor="new_time_circuito">Circuito</label>
                       <input 
                         type="text" 
                         id="new_time_circuito" 
                         list="circuitos-list"
                         placeholder="ej: Nürburgring Nordschleife"
                         className="form-control"
                         autoComplete="off"
                       />
                       <datalist id="circuitos-list">
                         {circuitosConocidos.map((circuito, index) => (
                           <option key={index} value={circuito} />
                         ))}
                       </datalist>
                       <small className="form-text text-muted">
                         Escribe o selecciona un circuito conocido de la lista desplegable
                       </small>
                     </div>
                     <div className="form-group">
                       <label htmlFor="new_time_vuelta">Tiempo Vuelta (*)</label>
                       <input 
                         type="text" 
                         id="new_time_vuelta" 
                         placeholder="09:14.930"
                         pattern="[0-9]{2}:[0-9]{2}\.[0-9]{1,3}"
                         className="form-control"
                         title="Formato: MM:SS.ms (Minutos:Segundos.milisegundos)"
                         maxLength="10"
                         style={{fontFamily: 'monospace'}}
                       />
                       <small className="form-text text-muted">
                         <strong>Formato obligatorio: MM:SS.ms</strong> (ej: 09:14.930 = 9 minutos, 14.930 segundos)<br/>
                         <strong>Importante:</strong> Siempre usar 2 dígitos para minutos y segundos
                       </small>
                     </div>
                     <div className="form-group">
                       <label htmlFor="new_time_condiciones">Condiciones</label>
                       <select id="new_time_condiciones" className="form-control">
                         <option value="">-- Selecciona --</option>
                         <option value="Seco">Seco</option>
                         <option value="Mojado">Mojado</option>
                         <option value="Húmedo">Húmedo</option>
                         <option value="Mixto">Mixto</option>
                         <option value="Nieve/Hielo">Nieve/Hielo</option>
                       </select>
                       <small className="form-text text-muted">Condiciones climáticas durante el registro</small>
                     </div>
                     <div className="form-group">
                       <label htmlFor="new_time_fecha">Fecha Record</label>
                       <input 
                         type="date" 
                         id="new_time_fecha" 
                         className="form-control"
                       />
                       <small className="form-text text-muted">Fecha en que se estableció el tiempo</small>
                     </div>
                     <div className="form-group">
                       <label htmlFor="new_time_piloto">Piloto</label>
                       <input 
                         type="text" 
                         id="new_time_piloto" 
                         placeholder="ej: Sport Auto"
                         className="form-control"
                       />
                       <small className="form-text text-muted">Piloto o revista que realizó la prueba</small>
                     </div>
                     <div className="form-group">
                       <label htmlFor="new_time_neumaticos">Neumáticos</label>
                       <input 
                         type="text" 
                         id="new_time_neumaticos" 
                         list="neumaticos-list"
                         placeholder="ej: Michelin Pilot Sport Cup 2"
                         className="form-control"
                         autoComplete="off"
                       />
                       <datalist id="neumaticos-list">
                         {neumaticosConocidos.map((neumatico, index) => (
                           <option key={index} value={neumatico} />
                         ))}
                       </datalist>
                       <small className="form-text text-muted">
                         Escribe o selecciona un neumático deportivo conocido de la lista desplegable
                       </small>
                     </div>
                   </div>
                   <button 
                     type="button" 
                     className="btn btn-success"
                     onClick={handleAddTime}
                     disabled={saving}
                   >
                     <FaPlus /> Añadir Tiempo
                   </button>
                 </div>
               </div>
             )}
           </section>
         )}

         {/* --- Botones de Acción del Formulario --- */}
         <div className="form-actions">
           <button type="submit" className="btn btn-primary" disabled={saving}>
             <FaSave /> {saving ? 'Guardando...' : (isEditing ? 'Actualizar Vehículo' : 'Crear Vehículo')}
           </button>
            {/* Enlace para cancelar y volver a la lista */}
            <Link to="/admin/vehicles" className="btn btn-secondary">
                <FaTimes /> Cancelar
            </Link>
         </div>
      </form>
    </div>
  );
};

export default AdminVehicleFormPage; 