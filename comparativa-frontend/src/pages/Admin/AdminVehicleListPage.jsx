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

const AdminVehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1); // Página actual solicitada
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_actualizacion', direction: 'DESC' }); // Configuración de ordenación

  const ITEMS_PER_PAGE = 20; // Número de vehículos por página

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
      setVehicles(response.data.data || []);
      setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
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
        if (window.confirm(`¿Estás MUY seguro de eliminar "${name}"?\n¡Esta acción es IRREVERSIBLE y borrará el vehículo junto con todas sus imágenes y tiempos asociados!`)) {
            try {
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
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Error al eliminar el vehículo.';
                toast.error(errorMsg);
                console.error("Error deleting vehicle:", err.response?.data || err.message);
                setLoading(false); // Quitar loading si falla
            }
            // setLoading(false) se quitará en el finally de fetchVehicles si la recarga tiene éxito
        }
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

      {/* Mostrar tabla y paginación si no hay error y la carga finalizó */}
      {!error && (
        <>
           {/* Contenedor de la tabla para scroll horizontal */}
           <div className="admin-table-container">
              <table className='admin-table table table-striped table-hover'> {/* Añadir clases Bootstrap si se usan */}
                 <thead>
                    <tr>
                       {/* Cabeceras clickeables para ordenar */}
                       <th onClick={() => handleSort('id_vehiculo')}>ID{getSortIcon('id_vehiculo')}</th>
                       <th onClick={() => handleSort('marca')}>Marca{getSortIcon('marca')}</th>
                       <th onClick={() => handleSort('modelo')}>Modelo{getSortIcon('modelo')}</th>
                       <th>Versión</th>
                       <th onClick={() => handleSort('año')}>Año{getSortIcon('año')}</th>
                       <th onClick={() => handleSort('potencia')}>Potencia{getSortIcon('potencia')}</th>
                       <th onClick={() => handleSort('combustible')}>Combustible{getSortIcon('combustible')}</th>
                       <th onClick={() => handleSort('precio_actual_estimado')}>Precio Est.{getSortIcon('precio_actual_estimado')}</th>
                       <th onClick={() => handleSort('fecha_actualizacion')}>Actualizado{getSortIcon('fecha_actualizacion')}</th>
                       <th>Acciones</th>
                    </tr>
                 </thead>
                 <tbody>
                    {/* Si no está cargando y no hay vehículos */}
                    {!loading && vehicles.length === 0 ? (
                        <tr>
                            <td colSpan="10" className="text-center">No se encontraron vehículos {searchTerm ? 'para la búsqueda actual' : ''}.</td>
                        </tr>
                    ) : (
                        // Mapear y mostrar cada vehículo
                       vehicles.map(v => (
                          <tr key={v.id_vehiculo}>
                             <td>{v.id_vehiculo}</td>
                             <td>{v.marca}</td>
                             <td>{v.modelo}</td>
                             <td>{v.version || '-'}</td>
                             <td>{v.año}</td>
                             <td>{v.potencia ? `${v.potencia} CV` : '-'}</td>
                             <td>{v.combustible}</td>
                             {/* Formatear precio estimado */}
                             <td>{v.precio_actual_estimado ? `${parseFloat(v.precio_actual_estimado).toLocaleString('es-ES')} €` : '-'}</td>
                             {/* Formatear fecha de actualización */}
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
    </div>
  );
};

export default AdminVehicleListPage; 