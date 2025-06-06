import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash } from 'react-icons/fa';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import VehicleCard from '../../components/Vehicles/VehicleCard';
import ScrollToTopCar from '../../components/Common/ScrollToTopCar';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar favoritos al montar el componente
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/users/favorites');
      const favoritesData = response.data.data || [];
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setError('No se pudieron cargar tus vehículos favoritos. Por favor, inténtalo de nuevo más tarde.');
      setFavorites([]); // Asegurar que favorites sea siempre un array
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (vehicleId) => {
    try {
      await apiClient.delete(`/users/favorites/${vehicleId}`);
      setFavorites(prev => {
        if (Array.isArray(prev)) {
          return prev.filter(fav => fav.id_vehiculo !== vehicleId);
        }
        return [];
      });
      toast.success('Vehículo eliminado de favoritos');
    } catch (error) {
      toast.error('Error al eliminar de favoritos');
      console.error('Error eliminando favorito:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando tus vehículos favoritos..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <h1><FaHeart /> Mis Vehículos Favoritos</h1>
        <p>Aquí puedes ver y gestionar tus vehículos favoritos.</p>
      </header>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <p>No tienes vehículos favoritos todavía.</p>
          <Link to="/vehicles" className="btn btn-primary">
            Explorar Vehículos
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {Array.isArray(favorites) && favorites.map(vehicle => (
            <div key={vehicle.id_vehiculo} className="favorite-item">
              <VehicleCard vehicle={vehicle} />
              <button
                onClick={() => handleRemoveFavorite(vehicle.id_vehiculo)}
                className="remove-favorite-button"
                title="Eliminar de favoritos"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Coche animado para volver arriba */}
      <ScrollToTopCar />
    </div>
  );
};

export default FavoritesPage; 