import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // Hook para interactuar con los query params de la URL
import apiClient from '../../services/api'; // Nuestro cliente Axios configurado
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import VehicleCard from '../../components/Vehicles/VehicleCard'; // Componente reutilizable para mostrar cada vehículo
import FilterSidebar from '../../components/Vehicles/FilterSidebar'; // Componente con los filtros
import Pagination from '../../components/Common/Pagination'; // Componente de paginación
import './VehiclesPage.css'; // Estilos específicos para esta página

const VehiclesPage = () => {
  // --- Estados del Componente ---
  const [vehicles, setVehicles] = useState([]); // Array para almacenar los vehículos obtenidos
  const [loading, setLoading] = useState(true); // Indicador de carga
  const [error, setError] = useState(null); // Mensaje de error si falla la carga
  const [pagination, setPagination] = useState({ // Información de paginación
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10, // Cambiado de 12 a 10 vehículos por página
  });
  const [filterOptions, setFilterOptions] = useState(null); // Opciones para los selects (marcas, tipos...)
  const [searchParams, setSearchParams] = useSearchParams(); // Hook para leer/escribir query params (ej. ?page=2&marca=Ford)

  // --- Callbacks para Obtener Datos ---
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Construir la URL con los parámetros de búsqueda actuales
      const params = Object.fromEntries(searchParams.entries());
      const response = await apiClient.get('/vehicles', { params });
      
      // Actualizar estados con los datos recibidos
      setVehicles(response.data.data.vehicles);
      setPagination({
        currentPage: response.data.data.currentPage,
        totalPages: response.data.data.totalPages,
        totalItems: response.data.data.totalItems,
        itemsPerPage: response.data.data.itemsPerPage,
      });
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err.response?.data?.message || 'Error al cargar los vehículos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]); // Dependencia: searchParams para re-ejecutar cuando cambian los filtros/página

  const fetchFilterOptions = useCallback(async () => {
    // Evitar llamadas innecesarias si ya tenemos las opciones
    if (filterOptions) return;
    try {
      const response = await apiClient.get('/vehicles/options');
      setFilterOptions(response.data); // Guardar las opciones en el estado
    } catch (err) {
      console.error('Error fetching filter options:', err);
      // No es crítico si falla, los filtros pueden funcionar sin opciones pre-cargadas
      // Podrías mostrar un aviso si quieres: toast.warn("No se pudieron cargar las opciones de filtro.")
    }
  }, [filterOptions]); // Dependencia: solo se re-crea si filterOptions cambia (que no debería una vez cargado)

  // --- Efectos Laterales (useEffect) ---
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]); // La dependencia es la función memorizada fetchVehicles

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]); // La dependencia es la función memorizada fetchFilterOptions

  // --- Manejadores de Eventos ---
  const handleFilterChange = useCallback((newFilters) => {
    // Obtener los parámetros actuales de la URL
    const currentParams = Object.fromEntries(searchParams.entries());
    
    // Si newFilters está completamente vacío, limpiar TODOS los filtros
    if (Object.keys(newFilters).length === 0) {
      console.log('🔄 RESETEO COMPLETO: Limpiando todos los filtros');
      
      // Reseteo completo: solo mantener ordenación por defecto y página 1
      const cleanParams = {
        sortBy: 'm.nombre',
        sortOrder: 'ASC',
        page: '1'
      };
      
      // Forzar actualización inmediata
      setSearchParams(cleanParams, { replace: true });
      
      // Doble verificación: limpiar completamente tras un pequeño delay
      setTimeout(() => {
        setSearchParams({
          sortBy: 'm.nombre',
          sortOrder: 'ASC', 
          page: '1'
        }, { replace: true });
      }, 50);
      
      return;
    }

    // Para filtros no vacíos, combinar con la ordenación actual
    const updatedParams = { 
      ...newFilters, 
      page: '1' // Siempre resetear a página 1 al filtrar
    };
    
    // Preservar ordenación si existe
    if (currentParams.sortBy) updatedParams.sortBy = currentParams.sortBy;
    if (currentParams.sortOrder) updatedParams.sortOrder = currentParams.sortOrder;

    // Limpiar parámetros que estén vacíos
    for (const key in updatedParams) {
      if (updatedParams[key] === '' || updatedParams[key] === null || updatedParams[key] === undefined) {
        delete updatedParams[key]; // Eliminar el parámetro si está vacío
      }
    }
    
    // Actualizar los searchParams en la URL, lo que disparará el useEffect de fetchVehicles
    setSearchParams(updatedParams, { replace: true }); // replace: true evita entradas duplicadas en el historial
  }, [searchParams, setSearchParams]);

  const handleSortChange = useCallback((sortBy, sortOrder) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    // Actualizar solo sortBy y sortOrder, resetear página a 1
    setSearchParams({ ...currentParams, sortBy, sortOrder, page: '1' }, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((newPage) => {
    // Mantener los filtros/ordenación actuales y solo cambiar la página
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, page: newPage.toString() }, { replace: true });
    // Opcional: Scroll al inicio de la lista al cambiar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

  // --- Renderizado del Componente ---
  return (
    <div className="page-container vehicles-page">
      <h1 className="page-title">Catálogo de Vehículos</h1>
      <div className="vehicles-layout">
        {/* Barra Lateral de Filtros */}
        <aside className="vehicles-sidebar">
          <FilterSidebar
            options={filterOptions} // Pasa las opciones cargadas (marcas, tipos...)
            initialFilters={Object.fromEntries(searchParams.entries())} // Pasa los filtros/ordenación actuales de la URL
            onFilterChange={handleFilterChange} // Callback para aplicar filtros
            onSortChange={handleSortChange} // Callback para aplicar ordenación
          />
        </aside>

        {/* Contenido Principal (Resultados y Paginación) */}
        <main className="vehicles-main-content">
          {/* Mostrar spinner mientras carga */}
          {loading && <LoadingSpinner message="Buscando vehículos..." />}
          {/* Mostrar mensaje de error si falla la carga */}
          {error && <ErrorMessage message={error} />}

          {/* Mostrar resultados si no está cargando y no hay error */}
          {!loading && !error && (
            <>
              {/* Grid de Tarjetas de Vehículo */}
              {vehicles.length > 0 ? (
                <div className="vehicles-grid">
                  {vehicles.map((vehicle) => {
                    // Mapeo de campos para compatibilidad con el resto de la app
                    const mappedVehicle = {
                      ...vehicle,
                      marca: vehicle.marca || vehicle.marca_nombre,
                      modelo: vehicle.modelo || vehicle.modelo_nombre,
                    };
                    return <VehicleCard key={vehicle.id_vehiculo} vehicle={mappedVehicle} />;
                  })}
                </div>
              ) : (
                <div className="no-results">
                  <h3>No se encontraron vehículos</h3>
                  <p>Prueba a ajustar los filtros de búsqueda para ver más resultados.</p>
                 </div>
              )}

              {/* Paginación (solo si hay resultados) */}
              {vehicles.length > 0 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default VehiclesPage; 