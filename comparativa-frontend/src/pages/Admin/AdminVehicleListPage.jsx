import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import Pagination from '../../components/Common/Pagination';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaEye } from 'react-icons/fa'; // Iconos
import { format, parseISO } from 'date-fns'; // Formatear fechas
import { toast } from 'react-toastify'; // Notificaciones
import './AdminPages.css'; // Estilos Admin
import ConfirmModal from '../../components/Common/ConfirmModal';
import useConfirmModal from '../../hooks/useConfirmModal';

const AdminVehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1); // Página actual solicitada
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_actualizacion', direction: 'DESC' }); // Configuración de ordenación

  const ITEMS_PER_PAGE = 20; // Número de vehículos por página

  // Hook del modal de confirmación
  const {
    isOpen: isConfirmOpen,
    modalConfig,
    loading: confirmLoading,
    openConfirmModal,
    closeConfirmModal,
    confirm
  } = useConfirmModal();

  // useCallback para memorizar la función de carga
  const fetchVehicles = useCallback(async (page = 1, search = '', sortKey = 'fecha_actualizacion', sortDir = 'DESC') => {
    setLoading(true);
    setError(null);
    try {
        // Construir parámetros para la API
        const params = {
            page: page,
            limit: ITEMS_PER_PAGE,
            sortBy: sortKey,
            sortOrder: sortDir,
            // Añadir búsqueda solo si no está vacía
            ...(search.trim() && { searchText: search.trim() })
        };
      const response = await apiClient.get('/vehicles', { params });
      
      // Asegurar que siempre sea un array accediendo a la estructura correcta
      const vehiclesData = response.data.data.vehicles; // Los vehículos están en data.vehicles
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      
      // Corregir también la paginación usando la estructura correcta
      const paginationData = {
        currentPage: response.data.data.currentPage || 1,
        totalPages: response.data.data.totalPages || 1,
        totalItems: response.data.data.totalItems || 0
      };
      setPagination(paginationData);
      setCurrentPage(page); // Actualizar estado de página actual
    } catch (err) {
      setError('Error al cargar la lista de vehículos.');
      console.error("Error fetching admin vehicles:", err.response?.data || err.message);
      setVehicles([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias aquí, se llama manualmente o desde otros effects

  // useEffect para cargar vehículos al inicio o cuando cambian página, búsqueda u ordenación
  useEffect(() => {
    fetchVehicles(currentPage, searchTerm, sortConfig.key, sortConfig.direction);
  }, [fetchVehicles, currentPage, searchTerm, sortConfig]);

  // Manejador para cambiar de página
   const handlePageChange = (newPage) => {
       setCurrentPage(newPage);
   };

    // Manejador para el input de búsqueda (con debounce opcional para no buscar en cada tecla)
    // const debouncedSearch = useCallback(debounce((term) => setSearchTerm(term), 500), []); // Necesitarías importar debounce (ej. de lodash)
    const handleSearchChange = (event) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm); // Actualizar estado de búsqueda
        setCurrentPage(1); // Resetear a página 1 al cambiar la búsqueda
        // Si usas debounce: debouncedSearch(newSearchTerm);
        // Si no usas debounce, el useEffect ya se disparará
    };

    // Manejador para cambiar la ordenación al hacer clic en cabeceras de tabla
    const handleSort = (key) => {
        let direction = 'ASC';
        // Si se hace clic en la misma columna, invertir dirección
        if (sortConfig.key === key && sortConfig.direction === 'ASC') {
            direction = 'DESC';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Resetear a página 1 al cambiar ordenación
    };

    // Manejador para eliminar un vehículo (con confirmación)
    const handleDelete = async (id, name) => {
        openConfirmModal({
            title: 'Eliminar Vehículo',
            message: `¿Estás MUY seguro de eliminar "${name}"?\n\n¡Esta acción es IRREVERSIBLE y borrará el vehículo junto con todas sus imágenes y tiempos asociados!`,
            confirmText: "ELIMINAR",
            cancelText: "Cancelar",
            type: "danger",
            onConfirm: () => confirm(async () => {
                setLoading(true); // Indicar carga durante la eliminación
                await apiClient.delete(`/vehicles/${id}`);
                toast.success(`Vehículo "${name}" eliminado correctamente.`);
                // Recargar la página actual después de eliminar
                // Si estamos en la última página y solo había un elemento, ir a la anterior
                if (vehicles.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                } else {
                    // Forzar recarga llamando a fetchVehicles (el useEffect lo hará si currentPage no cambia)
                     fetchVehicles(currentPage, searchTerm, sortConfig.key, sortConfig.direction);
                }
            })
        });
    };

    // Helper para mostrar el icono de ordenación en las cabeceras
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null; // No mostrar icono si no es la columna activa
        return sortConfig.direction === 'ASC' ? ' ▲' : ' ▼';
    };

  // --- Renderizado ---
  return (
    <div className="container admin-page">
      <h1 className="page-title">Gestionar Vehículos</h1>

       {/* Barra de acciones: Botón Añadir y Campo de Búsqueda */}
       <div className="admin-actions-bar">
             <Link to="/admin/vehicles/new" className="btn btn-success admin-add-button">
               <FaPlus /> Añadir Nuevo Vehículo
             </Link>
             <div className="admin-search-bar">
                 <FaSearch className="search-icon" />
                 <input
                     type="search" // Usar type="search" permite borrar con 'x' en algunos navegadores
                     placeholder="Buscar por Marca, Modelo, Versión..."
                     value={searchTerm}
                     onChange={handleSearchChange}
                     className="admin-search-input"
                 />
             </div>
       </div>

      {/* Mostrar spinner o error si aplica */}
      {loading && <LoadingSpinner message="Cargando vehículos..." />}
      {error && <ErrorMessage message={error} />}

      {/* Leyenda explicativa */}
      {!loading && !error && (
        <div className="admin-legend">
          <p><strong>Leyenda:</strong> <code>-</code> = No aplica • <code>N/D</code> = No disponible • Las columnas están organizadas por categorías: Información básica, Rendimiento, Consumo, Eléctrico, Dimensiones, Transmisión y Precios/Fechas</p>
        </div>
      )}

      {/* Mostrar tabla y paginación si no hay error y la carga finalizó */}
      {!error && (
        <>
           {/* Contenedor de la tabla para scroll horizontal */}
           <div className="admin-table-container">
              <table className='admin-table table table-striped table-hover'> {/* Añadir clases Bootstrap si se usan */}
                 <thead>
                    <tr>
                       {/* Cabeceras clickeables para ordenar - Información básica */}
                       <th onClick={() => handleSort('id_vehiculo')}>ID{getSortIcon('id_vehiculo')}</th>
                       <th onClick={() => handleSort('marca')}>Marca{getSortIcon('marca')}</th>
                       <th onClick={() => handleSort('modelo')}>Modelo{getSortIcon('modelo')}</th>
                       <th>Generación</th>
                       <th>Motorización</th>
                       <th>Versión</th>
                       <th onClick={() => handleSort('anio')}>Año{getSortIcon('anio')}</th>
                       <th onClick={() => handleSort('tipo')}>Tipo{getSortIcon('tipo')}</th>
                       <th onClick={() => handleSort('combustible')}>Combustible{getSortIcon('combustible')}</th>
                       <th>Etiqueta DGT</th>
                       
                       {/* Rendimiento */}
                       <th onClick={() => handleSort('potencia')}>Potencia{getSortIcon('potencia')}</th>
                       <th>Par Motor</th>
                       <th>Vel. Máx.</th>
                       <th>0-100 km/h</th>
                       <th>Frenada</th>
                       
                       {/* Consumo y emisiones */}
                       <th>Cons. Urbano</th>
                       <th>Cons. Extrarb.</th>
                       <th>Cons. Mixto</th>
                       <th>Emisiones</th>
                       
                       {/* Eléctrico */}
                       <th>Autonomía</th>
                       <th>Batería</th>
                       <th>Carga AC</th>
                       <th>Pot. DC</th>
                       <th>Carga DC</th>
                       
                       {/* Dimensiones */}
                       <th>Peso</th>
                       <th>Puertas</th>
                       <th>Plazas</th>
                       <th>Maletero</th>
                       <th>Maletero Máx.</th>
                       <th>Largo</th>
                       <th>Ancho</th>
                       <th>Alto</th>
                       <th>Distancia Ejes</th>
                       
                       {/* Transmisión */}
                       <th>Tracción</th>
                       <th>Caja Cambios</th>
                       <th>Marchas</th>
                       
                       {/* Precios y fechas */}
                       <th onClick={() => handleSort('precio_original')}>Precio Orig.{getSortIcon('precio_original')}</th>
                       <th onClick={() => handleSort('precio_actual_estimado')}>Precio Est.{getSortIcon('precio_actual_estimado')}</th>
                       <th>Lanzamiento</th>
                       <th onClick={() => handleSort('fecha_creacion')}>Creado{getSortIcon('fecha_creacion')}</th>
                       <th onClick={() => handleSort('fecha_actualizacion')}>Actualizado{getSortIcon('fecha_actualizacion')}</th>
                       
                       {/* Acciones */}
                       <th>Acciones</th>
                    </tr>
                 </thead>
                 <tbody>
                    {/* Si no está cargando y no hay vehículos */}
                    {!loading && (!Array.isArray(vehicles) || vehicles.length === 0) ? (
                        <tr>
                            <td colSpan="42" className="text-center">No se encontraron vehículos {searchTerm ? 'para la búsqueda actual' : ''}.</td>
                        </tr>
                    ) : (
                        // Mapear y mostrar cada vehículo
                       Array.isArray(vehicles) && vehicles.map(v => (
                          <tr key={v.id_vehiculo}>
                             {/* Información básica */}
                             <td>{v.id_vehiculo}</td>
                             <td>{v.marca}</td>
                             <td>{v.modelo}</td>
                             <td>{v.generacion || '-'}</td>
                             <td>{v.motorizacion || '-'}</td>
                             <td>{v.version || '-'}</td>
                             <td>{v.anio}</td>
                             <td>{v.tipo}</td>
                             <td>{v.combustible}</td>
                             <td>{v.pegatina_ambiental || '-'}</td>
                             
                             {/* Rendimiento */}
                             <td>{v.potencia ? `${v.potencia} CV` : '-'}</td>
                             <td>{v.par_motor ? `${v.par_motor} Nm` : '-'}</td>
                             <td>{v.velocidad_max ? `${v.velocidad_max} km/h` : '-'}</td>
                             <td>{v.aceleracion_0_100 ? `${v.aceleracion_0_100} s` : '-'}</td>
                             <td>{v.distancia_frenado_100_0 ? `${v.distancia_frenado_100_0} m` : '-'}</td>
                             
                             {/* Consumo y emisiones */}
                             <td>{v.consumo_urbano ? `${v.consumo_urbano} l/100km` : '-'}</td>
                             <td>{v.consumo_extraurbano ? `${v.consumo_extraurbano} l/100km` : '-'}</td>
                             <td>{v.consumo_mixto ? `${v.consumo_mixto} l/100km` : '-'}</td>
                             <td>{v.emisiones ? `${v.emisiones} g/km` : '-'}</td>
                             
                             {/* Eléctrico */}
                             <td>{v.autonomia_electrica ? `${v.autonomia_electrica} km` : (v.combustible === 'Eléctrico' || v.combustible === 'Híbrido Enchufable') ? 'N/D' : '-'}</td>
                             <td>{v.capacidad_bateria ? `${v.capacidad_bateria} kWh` : (v.combustible === 'Eléctrico' || v.combustible === 'Híbrido Enchufable') ? 'N/D' : '-'}</td>
                             <td>{v.tiempo_carga_ac ? `${v.tiempo_carga_ac} h` : (v.combustible === 'Eléctrico' || v.combustible === 'Híbrido Enchufable') ? 'N/D' : '-'}</td>
                             <td>{v.potencia_carga_dc ? `${v.potencia_carga_dc} kW` : (v.combustible === 'Eléctrico' || v.combustible === 'Híbrido Enchufable') ? 'N/D' : '-'}</td>
                             <td>{v.tiempo_carga_dc_10_80 ? `${v.tiempo_carga_dc_10_80} min` : (v.combustible === 'Eléctrico' || v.combustible === 'Híbrido Enchufable') ? 'N/D' : '-'}</td>
                             
                             {/* Dimensiones */}
                             <td>{v.peso ? `${v.peso} kg` : '-'}</td>
                             <td>{v.num_puertas || '-'}</td>
                             <td>{v.num_plazas || '-'}</td>
                             <td>{v.vol_maletero ? `${v.vol_maletero} l` : '-'}</td>
                             <td>{v.vol_maletero_max ? `${v.vol_maletero_max} l` : '-'}</td>
                             <td>{v.dimension_largo ? `${v.dimension_largo} mm` : '-'}</td>
                             <td>{v.dimension_ancho ? `${v.dimension_ancho} mm` : '-'}</td>
                             <td>{v.dimension_alto ? `${v.dimension_alto} mm` : '-'}</td>
                             <td>{v.distancia_entre_ejes ? `${v.distancia_entre_ejes} mm` : '-'}</td>
                             
                             {/* Transmisión */}
                             <td>{v.traccion || '-'}</td>
                             <td>{v.caja_cambios || '-'}</td>
                             <td>{v.num_marchas || '-'}</td>
                             
                             {/* Precios y fechas */}
                             <td>{v.precio_original ? `${parseFloat(v.precio_original).toLocaleString('es-ES')} €` : '-'}</td>
                             <td>{v.precio_actual_estimado ? `${parseFloat(v.precio_actual_estimado).toLocaleString('es-ES')} €` : '-'}</td>
                             <td>{v.fecha_lanzamiento ? format(parseISO(v.fecha_lanzamiento), 'dd/MM/yyyy') : '-'}</td>
                             <td>{v.fecha_creacion ? format(parseISO(v.fecha_creacion), 'dd/MM/yy HH:mm') : '-'}</td>
                             <td>{v.fecha_actualizacion ? format(parseISO(v.fecha_actualizacion), 'dd/MM/yy HH:mm') : '-'}</td>
                             
                             {/* Botones de acción */}
                             <td className='admin-table-actions'>
                                <Link to={`/vehicles/${v.id_vehiculo}`} className="action-link view" title="Ver Público" target="_blank"><FaEye/></Link>
                                <Link to={`/admin/vehicles/edit/${v.id_vehiculo}`} className="action-link edit" title="Editar"><FaEdit/></Link>
                                <button onClick={() => handleDelete(v.id_vehiculo, `${v.marca} ${v.modelo}`)} className="action-link delete" title="Eliminar"><FaTrash/></button>
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>

           {/* Paginación (solo si hay más de una página) */}
           {!loading && pagination.totalPages > 1 && (
             <Pagination
               currentPage={pagination.currentPage}
               totalPages={pagination.totalPages}
               onPageChange={handlePageChange}
             />
           )}
        </>
      )}
      
      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={closeConfirmModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
        loading={confirmLoading}
      />
    </div>
  );
};

export default AdminVehicleListPage; 