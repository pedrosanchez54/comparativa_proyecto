import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // useParams para ID, useNavigate para redirigir
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { FaSave, FaTimes, FaArrowLeft, FaCar, FaBolt, FaRulerCombined, FaCogs, FaLeaf, FaTachometerAlt } from 'react-icons/fa'; // Iconos
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import './AdminPages.css'; // Estilos Admin

// --- Definiciones Constantes (ENUMs de la BD) ---
const vehicleTypes = ['Sedán','SUV','Deportivo','Hatchback','Coupé','Furgoneta','Urbano','Pick-up','Monovolumen','Cabrio','Familiar','Otro'];
const fuelTypes = ['Gasolina','Diésel','Híbrido','Híbrido Enchufable','Eléctrico','GLP','GNC','Hidrógeno','Otro'];
const dgtLabels = ['0','ECO','B','C','Sin etiqueta'];
const tractions = ['Delantera', 'Trasera', 'Total', 'Total Desconectable'];
const gearboxes = ['Manual', 'Automática Convertidor Par', 'Automática CVT', 'Automática Doble Embrague', 'Directa Eléctrico', 'Otra'];

// --- Estado Inicial del Formulario ---
const initialFormData = {
    marca: '', modelo: '', version: '', año: new Date().getFullYear(), tipo: '',
    combustible: '', pegatina_ambiental: 'Sin etiqueta', potencia: '', par_motor: '',
    velocidad_max: '', aceleracion_0_100: '', distancia_frenado_100_0: '',
    consumo_urbano: '', consumo_extraurbano: '', consumo_mixto: '', emisiones: '',
    autonomia_electrica: '', capacidad_bateria: '', tiempo_carga_ac: '',
    potencia_carga_dc: '', tiempo_carga_dc_10_80: '', peso: '', num_puertas: '',
    num_plazas: '', vol_maletero: '', vol_maletero_max: '', dimension_largo: '',
    dimension_ancho: '', dimension_alto: '', distancia_entre_ejes: '', traccion: '',
    caja_cambios: '', num_marchas: '', precio_original: '', precio_actual_estimado: '',
    fecha_lanzamiento: '',
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

  // --- Carga de Datos (si estamos editando) ---
  const fetchVehicleData = useCallback(async () => {
    if (!isEditing) return; // No hacer nada si es un vehículo nuevo

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/vehicles/${id}`);
      const fetchedData = response.data.data;

      // Pre-procesar datos para el formulario:
      // 1. Formatear fecha_lanzamiento a YYYY-MM-DD para input type="date"
      if (fetchedData.fecha_lanzamiento) {
            try {
                fetchedData.fecha_lanzamiento = format(parseISO(fetchedData.fecha_lanzamiento), 'yyyy-MM-dd');
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
    fetchVehicleData();
  }, [fetchVehicleData]);

  // Cargar opciones desde la API
  useEffect(() => {
    apiClient.get('/vehicles/options').then(res => {
      setMarcas(res.data.marcas);
      setModelos(res.data.modelos);
      setGeneraciones(res.data.generaciones);
      setMotorizaciones(res.data.motorizaciones);
    });
  }, []);

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
    setVehicleData(prev => ({ ...prev, [name]: value }));
  };

  // Manejador para enviar el formulario (Crear o Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir envío HTML
    setSaving(true); // Indicar inicio de guardado
    setError(null); // Limpiar errores previos

    // Preparar datos para enviar a la API:
    // Convertir strings vacíos de campos numéricos/fecha a NULL
    const dataToSend = {
      id_motorizacion: selectedMotorizacion,
      anio: vehicleData.año,
      tipo: vehicleData.tipo,
      version: vehicleData.version,
      pegatina_ambiental: vehicleData.pegatina_ambiental,
      velocidad_max: vehicleData.velocidad_max,
      aceleracion_0_100: vehicleData.aceleracion_0_100,
      consumo_mixto: vehicleData.consumo_mixto,
      emisiones: vehicleData.emisiones,
      peso: vehicleData.peso,
      precio_original: vehicleData.precio_original,
      precio_actual_estimado: vehicleData.precio_actual_estimado,
      // ...otros campos de la tabla Vehiculo
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

  // --- Renderizado ---
  if (loading) return <LoadingSpinner message="Cargando datos del formulario..." />;
  // No mostrar error global aquí, se muestra dentro del formulario

  return (
    <div className="container admin-page">
       {/* Enlace para volver a la lista */}
       <Link to="/admin/vehicles" className="back-link" style={{ marginBottom: '20px', display: 'inline-block' }}>
           <FaArrowLeft /> Volver a la lista de vehículos
       </Link>

      <h1 className="page-title">{isEditing ? 'Editar Vehículo' : 'Añadir Nuevo Vehículo'}</h1>

      {/* Formulario principal */}
      <form onSubmit={handleSubmit} className="admin-form card">
         {/* Mostrar error de carga/guardado aquí */}
         {error && <ErrorMessage message={error} />}

         {/* --- Sección Información General --- */}
         <section className='form-section'>
            <h2 className='form-section-title'><FaCar /> Información General</h2>
            <div className="form-grid">
                {/* Campos: Marca(*), Modelo(*), Version, Año(*), Tipo(*), Combustible(*), Etiqueta, Precio Orig, Precio Est, Fecha Lanz. */}
                {/* Ejemplo de campo obligatorio (Marca) */}
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
                 {/* Version */}
                <div className="form-group">
                    <label htmlFor="version">Versión</label>
                    <input type="text" id="version" name="version" value={vehicleData.version || ''} onChange={handleInputChange} maxLength="100" disabled={saving}/>
                </div>
                 {/* Año (*) */}
                <div className="form-group">
                     <label htmlFor="año">Año (*)</label>
                     <input type="number" id="año" name="año" value={vehicleData.año || ''} onChange={handleInputChange} required min="1886" max={new Date().getFullYear() + 2} step="1" disabled={saving}/>
                </div>
                  {/* Tipo (*) */}
                 <div className="form-group">
                     <label htmlFor="tipo">Tipo (*)</label>
                     <select id="tipo" name="tipo" value={vehicleData.tipo || ''} onChange={handleInputChange} required disabled={saving}>
                         <option value="">-- Selecciona --</option>
                         {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                 </div>
                 {/* Combustible (*) */}
                 <div className="form-group">
                     <label htmlFor="combustible">Combustible (*)</label>
                     <select id="combustible" name="combustible" value={vehicleData.combustible || ''} onChange={handleInputChange} required disabled={saving}>
                         <option value="">-- Selecciona --</option>
                         {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                     </select>
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
                    {/* Fecha Lanzamiento */}
                   <div className="form-group">
                        <label htmlFor="fecha_lanzamiento">Fecha Lanzamiento</label>
                        <input type="date" id="fecha_lanzamiento" name="fecha_lanzamiento" value={vehicleData.fecha_lanzamiento || ''} onChange={handleInputChange} disabled={saving} />
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