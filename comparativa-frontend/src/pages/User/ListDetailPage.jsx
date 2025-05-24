import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useParams para leer ID de lista
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import VehicleCard from '../../components/Vehicles/VehicleCard'; // Reutilizamos tarjeta
import { FaArrowLeft, FaTrash, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa'; // Iconos
import { toast } from 'react-toastify'; // Notificaciones
import './UserPages.css'; // Estilos comunes (incluye .list-detail-page, .remove-from-list-btn)

const ListDetailPage = () => {
  const { idLista } = useParams(); // Obtener ID de la lista desde la URL
  const [listDetails, setListDetails] = useState(null); // Datos de la lista (nombre, desc)
  const [vehicles, setVehicles] = useState([]); // Vehículos contenidos en la lista
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicles, setSelectedVehicles] = useState(new Set()); // IDs seleccionados para comparar
  const navigate = useNavigate(); // Para navegación

  // Función para cargar los detalles de la lista y sus vehículos
  const fetchListDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedVehicles(new Set()); // Resetear selección
    try {
      // Llamada a la API para obtener detalles y vehículos
      const response = await apiClient.get(`/lists/${idLista}`);
      setListDetails(response.data.data);
      setVehicles(response.data.data?.vehiculos || []); // Asegurar que es un array
    } catch (err) {
      // Manejar errores específicos (404 No encontrado, 403 Prohibido)
      if (err.response?.status === 404) {
        setError('Lista no encontrada.');
      } else if (err.response?.status === 403) {
        setError('No tienes permiso para ver esta lista.');
      } else {
        setError('Error al cargar los detalles de la lista.');
      }
      console.error("Error fetching list details:", err.response?.data || err.message);
      setListDetails(null); // Limpiar datos en caso de error
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [idLista]); // Dependencia: ID de la lista

  // useEffect para cargar datos al montar o si cambia el ID de la lista
  useEffect(() => {
    fetchListDetails();
  }, [fetchListDetails]);

  // Manejador para seleccionar/deseleccionar vehículo para comparar
  const handleSelectVehicle = (vehicleId) => {
    setSelectedVehicles(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(vehicleId)) {
        newSelected.delete(vehicleId);
      } else {
        if (newSelected.size < 4) { // Límite de 4
          newSelected.add(vehicleId);
        } else {
          toast.warn("Puedes seleccionar un máximo de 4 vehículos para comparar.");
        }
      }
      return newSelected;
    });
  };

  // Manejador para el botón "Comparar Seleccionados"
  const handleCompareSelected = () => {
    if (selectedVehicles.size < 2) { // Requiere mínimo 2
      toast.warn("Selecciona al menos 2 vehículos para comparar.");
      return;
    }
    const idsToCompare = Array.from(selectedVehicles);
    // Navegar a la página de comparación pasando IDs en el estado
    navigate('/compare', { state: { vehicleIds: idsToCompare } });
  };

  // Manejador para quitar un vehículo de ESTA lista (botón papelera en la tarjeta)
  const handleRemoveVehicle = async (vehicleId, vehicleName) => {
    // Confirmación
    if (window.confirm(`¿Estás seguro de que quieres quitar "${vehicleName}" de esta lista?`)) {
      try {
        // Llamada a la API para eliminar la relación
        await apiClient.delete(`/lists/${idLista}/vehicles/${vehicleId}`);
        toast.success(`"${vehicleName}" quitado de la lista.`);
        // Actualizar estado local para reflejar el cambio sin recargar toda la página
        setVehicles(prev => prev.filter(v => v.id_vehiculo !== vehicleId));
        // Quitar también de los seleccionados si estaba marcado
        setSelectedVehicles(prev => {
          const newSelected = new Set(prev);
          newSelected.delete(vehicleId);
          return newSelected;
        });
        // Actualizar contador en listDetails (si se muestra)
        if (listDetails) {
          setListDetails(prev => ({...prev, vehicle_count: (prev.vehicle_count || 1) - 1}));
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Error al quitar el vehículo de la lista.';
        toast.error(errorMsg);
        console.error("Error removing vehicle from list:", err.response?.data || err.message);
      }
    }
  };

  // --- Renderizado ---
  if (loading) return <LoadingSpinner message="Cargando detalles de la lista..." />;
  // Mostrar error si falló la carga inicial
  if (error) return (
    <div className="container user-page">
      <ErrorMessage message={error} />
      <Link to="/my-lists" className="btn btn-secondary mt-2"><FaArrowLeft /> Volver a Mis Listas</Link>
    </div>
  );
  // Mensaje si no se cargaron detalles (poco probable si no hubo error, pero por seguridad)
  if (!listDetails) return (
    <div className="container user-page">
      <p>No se pudieron cargar los detalles de la lista.</p>
      <Link to="/my-lists" className="btn btn-secondary mt-2"><FaArrowLeft /> Volver a Mis Listas</Link>
    </div>
  );

  return (
    <div className="container user-page list-detail-page">
      {/* Enlace para volver a la página de listas */}
      <Link to="/my-lists" className="back-link"><FaArrowLeft /> Volver a Mis Listas</Link>

      {/* Título y descripción de la lista */}
      <h1 className="page-title">{listDetails.nombre_lista}</h1>
      {listDetails.descripcion && <p className="list-description">{listDetails.descripcion}</p>}

      {/* Mostrar vehículos o mensaje si está vacía */}
      {vehicles.length > 0 ? (
        <>
          {/* Acciones de comparación */}
          <div className="compare-actions card">
            <p>Selecciona de 2 a 4 vehículos de esta lista para comparar:</p>
            <button
              className="btn btn-success"
              onClick={handleCompareSelected}
              disabled={selectedVehicles.size < 2} // Deshabilitar si hay menos de 2
            >
              <FaExchangeAlt /> Comparar Seleccionados ({selectedVehicles.size})
            </button>
          </div>

          {/* Grid de vehículos en la lista */}
          <div className="user-items-grid">
            {vehicles.map((vehicle) => (
              // Contenedor para tarjeta, checkbox y botón de eliminar
              <div key={vehicle.id_vehiculo} className="selectable-card-container list-item-card">
                {/* Checkbox de selección */}
                <input
                  type="checkbox"
                  id={`select-list-${vehicle.id_vehiculo}`}
                  className="vehicle-select-checkbox"
                  checked={selectedVehicles.has(vehicle.id_vehiculo)}
                  onChange={() => handleSelectVehicle(vehicle.id_vehiculo)}
                  disabled={!selectedVehicles.has(vehicle.id_vehiculo) && selectedVehicles.size >= 4}
                />
                {/* Botón para quitar de la lista (posicionado absolutamente) */}
                <button
                  className="remove-from-list-btn"
                  title="Quitar de esta lista"
                  onClick={() => handleRemoveVehicle(vehicle.id_vehiculo, `${vehicle.marca} ${vehicle.modelo}`)}
                  aria-label={`Quitar ${vehicle.marca} ${vehicle.modelo} de la lista`}
                >
                  <FaTrash />
                </button>
                {/* Label asociado al checkbox que envuelve la tarjeta */}
                <label htmlFor={`select-list-${vehicle.id_vehiculo}`} className="card-select-label">
                  {/* Reutilizamos VehicleCard */}
                  <VehicleCard vehicle={vehicle} />
                </label>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Mensaje si la lista está vacía
        <div className="no-results card text-center">
          <FaInfoCircle size={40} color="#ccc" />
          <p>Esta lista aún no contiene ningún vehículo.</p>
          <Link to="/vehicles" className="btn btn-primary mt-2">
            Añadir Vehículos desde el Catálogo
          </Link>
        </div>
      )}
    </div>
  );
};

export default ListDetailPage; 