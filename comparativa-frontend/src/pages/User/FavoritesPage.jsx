import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { toast } from 'react-toastify';
=======
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import VehicleCard from '../../components/Vehicles/VehicleCard'; // Reutilizamos la tarjeta
<<<<<<< HEAD
import { FaHeartBroken, FaExchangeAlt, FaRegHeart } from 'react-icons/fa'; // Iconos
=======
import { FaHeartBroken, FaExchangeAlt } from 'react-icons/fa'; // Iconos
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
import './UserPages.css'; // Estilos comunes para páginas de usuario

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]); // Estado para guardar los vehículos favoritos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Usamos un Set para almacenar los IDs de los vehículos seleccionados (eficiente para añadir/quitar/comprobar)
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const navigate = useNavigate(); // Hook para navegación programática

  // Función para cargar los favoritos del usuario desde la API
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedVehicles(new Set()); // Resetear selección al cargar
    try {
      const response = await apiClient.get('/favorites'); // Llama al endpoint del backend
      setFavorites(response.data.data || []); // Asegura que sea un array
    } catch (err) {
      setError('Error al cargar tus vehículos favoritos.');
      console.error("Error fetching favorites:", err.response?.data || err.message);
      setFavorites([]); // Limpiar en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect para cargar los favoritos cuando el componente se monta
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]); // La dependencia es la función memorizada

  // Manejador para seleccionar/deseleccionar un vehículo para comparar
  const handleSelectVehicle = (vehicleId) => {
    setSelectedVehicles(prevSelected => {
      const newSelected = new Set(prevSelected); // Copiar el Set actual
      if (newSelected.has(vehicleId)) {
        newSelected.delete(vehicleId); // Si ya está, quitarlo
      } else {
        // Limitar a un máximo de 4 vehículos para comparar
        if (newSelected.size < 4) {
            newSelected.add(vehicleId); // Si no está y hay espacio, añadirlo
        } else {
            // Informar al usuario si intenta seleccionar más de 4
            toast.warn("Puedes seleccionar un máximo de 4 vehículos para comparar.");
        }
      }
      return newSelected; // Devolver el nuevo Set actualizado
    });
  };

  // Manejador para el botón "Comparar Seleccionados"
  const handleCompareSelected = () => {
     // Validar que se han seleccionado al menos 2 vehículos
     if (selectedVehicles.size < 2) {
         toast.warn("Selecciona al menos 2 vehículos para iniciar la comparación.");
         return;
     }
     // Convertir el Set de IDs a un array
     const idsToCompare = Array.from(selectedVehicles);
     // Navegar a la página de comparación (/compare)
     // Pasamos los IDs a través del 'state' de la navegación (no visible en URL)
     navigate('/compare', { state: { vehicleIds: idsToCompare } });
  };

  // --- Renderizado ---
  if (loading) return <LoadingSpinner message="Cargando tus favoritos..." />;
  if (error) return <div className="container user-page"><ErrorMessage message={error} /></div>;

  return (
    <div className="container user-page">
      <h1 className="page-title">Mis Vehículos Favoritos</h1>

      {/* Mostrar contenido solo si hay favoritos */}
      {favorites.length > 0 ? (
        <>
          {/* Sección de acciones para comparar */}
          <div className="compare-actions card">
             <p>Selecciona de 2 a 4 vehículos para ver la comparativa:</p>
            <button
              className="btn btn-success"
              onClick={handleCompareSelected}
              // Deshabilitar botón si no hay al menos 2 seleccionados
              disabled={selectedVehicles.size < 2}
            >
              <FaExchangeAlt /> Comparar Seleccionados ({selectedVehicles.size})
            </button>
          </div>

          {/* Grid para mostrar las tarjetas de los vehículos favoritos */}
          <div className="user-items-grid">
            {favorites.map((favVehicle) => (
              // Contenedor para la tarjeta y el checkbox de selección
              <div key={favVehicle.id_vehiculo} className="selectable-card-container">
                 {/* Checkbox para seleccionar/deseleccionar */}
                 <input
                    type="checkbox"
                    id={`select-fav-${favVehicle.id_vehiculo}`} // ID único para el label
                    className="vehicle-select-checkbox"
                    // Marcar si el ID está en el Set de seleccionados
                    checked={selectedVehicles.has(favVehicle.id_vehiculo)}
                    // Llama al handler al cambiar
                    onChange={() => handleSelectVehicle(favVehicle.id_vehiculo)}
                    // Deshabilitar si ya hay 4 seleccionados y este no está marcado
                    disabled={!selectedVehicles.has(favVehicle.id_vehiculo) && selectedVehicles.size >= 4}
                 />
                 {/* Label asociado al checkbox, envuelve la tarjeta para hacerla clickeable (aunque desactivamos cursor) */}
                 <label htmlFor={`select-fav-${favVehicle.id_vehiculo}`} className="card-select-label">
                     {/* Reutilizamos el componente VehicleCard */}
                     <VehicleCard vehicle={favVehicle} />
                     {/* El botón de favorito DENTRO de VehicleCard se actualizará solo
                         porque consultará su propio estado a la API. */}
                 </label>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Mensaje si no hay favoritos
        <div className="no-results card text-center">
          <FaHeartBroken size={50} color="#ccc" />
          <p>Aún no has añadido ningún vehículo a tus favoritos.</p>
          <p>Explora el catálogo y haz clic en el corazón <FaRegHeart style={{color: '#adb5bd'}}/> para guardar los que te interesen.</p>
          <Link to="/vehicles" className="btn btn-primary mt-2">
            Explorar Vehículos
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage; 