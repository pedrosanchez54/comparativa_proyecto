<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState, useEffect, useCallback } from 'react';
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
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
    itemsPerPage: 12, // Valor por defecto, se actualizará desde la API
  });
  const [filterOptions, setFilterOptions] = useState(null); // Opciones para los selects (marcas, tipos...)
  const [searchParams, setSearchParams] = useSearchParams(); // Hook para leer/escribir query params (ej. ?page=2&marca=Ford)

  // --- Callbacks para Obtener Datos ---

<<<<<<< HEAD
  // Cargar vehículos
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(searchParams.entries());
        const response = await apiClient.get('/vehicles', { params });
        setVehicles(response.data.data);
        setPagination(response.data.pagination);
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Error al cargar los vehículos. Por favor, inténtalo de nuevo más tarde.');
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [searchParams]);

  // Cargar opciones de filtros
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await apiClient.get('/vehicles/options');
        setFilterOptions(response.data);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchOptions();
  }, []);
=======
  // useCallback para obtener vehículos. Se memoriza y solo se re-crea si searchParams cambia.
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Convertir los searchParams actuales en objeto
      const params = Object.fromEntries(searchParams.entries());
      // Solo enviar los filtros relevantes (id_marca, id_modelo, id_generacion, id_motorizacion, tipo, etc.)
      const allowedParams = ['id_marca','id_modelo','id_generacion','id_motorizacion','tipo','combustible','pegatina_ambiental','traccion','caja_cambios','num_puertas','num_plazas','añoMin','añoMax','potMin','potMax','precioMin','precioMax','pesoMin','pesoMax','page','limit','sortBy','sortOrder'];
      const filteredParams = Object.fromEntries(Object.entries(params).filter(([k]) => allowedParams.includes(k)));
      // Llamar a la API del backend con los parámetros actuales
      const response = await apiClient.get('/vehicles', { params: filteredParams });
      setVehicles(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Error al cargar los vehículos. Inténtalo de nuevo más tarde.');
      setVehicles([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 12 });
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // useCallback para obtener las opciones de los filtros (marcas, tipos, etc.)
  const fetchFilterOptions = useCallback(async () => {
    // Evitar llamadas innecesarias si ya tenemos las opciones
    if (filterOptions) return;
    try {
      const response = await apiClient.get('/vehicles/options');
      setFilterOptions(response.data); // Guardar las opciones en el estado
    } catch (err) {
      console.error('Error fetching filter options:', err);
      // No es crítico si falla, los filtros pueden funcionar sin opciones pre-cargadas (inputs de texto)
      // Podrías mostrar un aviso si quieres: toast.warn("No se pudieron cargar las opciones de filtro.")
    }
  }, [filterOptions]); // Dependencia: solo se re-crea si filterOptions cambia (que no debería una vez cargado)

  // --- Efectos Laterales (useEffect) ---

  // useEffect para cargar los vehículos cuando el componente se monta o cuando cambian los searchParams
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]); // La dependencia es la función memorizada fetchVehicles

  // useEffect para cargar las opciones de filtros solo una vez al montar el componente
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]); // La dependencia es la función memorizada fetchFilterOptions
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445

  // --- Manejadores de Eventos ---

  // Handler llamado por FilterSidebar cuando se aplican nuevos filtros
<<<<<<< HEAD
  const handleFilterChange = (newFilters) => {
    const params = { ...newFilters };
    if (!params.page) {
      params.page = '1';
    }
    setSearchParams(params);
  };

  // Handler llamado por FilterSidebar cuando cambia la ordenación
  const handleSortChange = (sortBy, sortOrder) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, sortBy, sortOrder, page: '1' });
  };

  // Handler llamado por Pagination cuando se cambia de página
  const handlePageChange = (newPage) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, page: newPage.toString() });
  };
=======
  const handleFilterChange = useCallback((newFilters) => {
    // Obtener los parámetros actuales de la URL
    const currentParams = Object.fromEntries(searchParams.entries());
    // Combinar filtros actuales y nuevos. IMPORTANTE: Resetear la página a 1 al aplicar nuevos filtros.
    const updatedParams = { ...currentParams, ...newFilters, page: '1' };

    // Limpiar parámetros que estén vacíos (ej. si se selecciona "-- Todas --" en un select)
     for (const key in updatedParams) {
        if (updatedParams[key] === '' || updatedParams[key] === null || updatedParams[key] === undefined) {
            delete updatedParams[key]; // Eliminar el parámetro si está vacío
        }
     }
    // Actualizar los searchParams en la URL, lo que disparará el useEffect de fetchVehicles
    setSearchParams(updatedParams, { replace: true }); // replace: true evita entradas duplicadas en el historial
  }, [searchParams, setSearchParams]);

  // Handler llamado por FilterSidebar cuando cambia la ordenación
   const handleSortChange = useCallback((sortBy, sortOrder) => {
       const currentParams = Object.fromEntries(searchParams.entries());
       // Actualizar solo sortBy y sortOrder, resetear página a 1
       setSearchParams({ ...currentParams, sortBy, sortOrder, page: '1' }, { replace: true });
   }, [searchParams, setSearchParams]);

  // Handler llamado por Pagination cuando se cambia de página
  const handlePageChange = useCallback((newPage) => {
    // Mantener los filtros/ordenación actuales y solo cambiar la página
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, page: newPage.toString() }, { replace: true });
    // Opcional: Scroll al inicio de la lista al cambiar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445

  // --- Renderizado del Componente ---
  return (
    <div className="container vehicles-page">
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
<<<<<<< HEAD
              {vehicles.length > 0 ? (
                <div className="vehicles-grid">
                  {vehicles.map((vehicle) => (
=======
              {/* Grid de Tarjetas de Vehículo */}
              {vehicles.length > 0 ? (
                <div className="vehicles-grid">
                  {vehicles.map((vehicle) => (
                    // Renderiza una tarjeta por cada vehículo
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
                    <VehicleCard key={vehicle.id_vehiculo} vehicle={vehicle} />
                  ))}
                </div>
              ) : (
<<<<<<< HEAD
                <div className="no-results card">
                  <p>No se encontraron vehículos que coincidan con tus criterios.</p>
                  <p>Intenta ajustar los filtros o la búsqueda.</p>
                </div>
              )}

=======
                 // Mensaje si no hay resultados
                 <div className="no-results card">
                    <p>No se encontraron vehículos que coincidan con tus criterios.</p>
                    <p>Intenta ajustar los filtros o la búsqueda.</p>
                 </div>
              )}

              {/* Paginación (solo si hay más de una página) */}
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
<<<<<<< HEAD
                  onPageChange={handlePageChange}
=======
                  onPageChange={handlePageChange} // Callback para cambiar página
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
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