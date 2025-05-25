import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import './AddToFavoritesButton.css';

/**
 * Botón para añadir o quitar un vehículo de la lista de favoritos del usuario.
 * @param {object} props - Propiedades.
 * @param {number} props.vehicleId - El ID del vehículo al que se asocia el botón.
 */
const AddToFavoritesButton = ({ vehicleId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si el vehículo está en favoritos al cargar
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/users/favorites/${vehicleId}`);
        setIsFavorite(response.data.isFavorite);
      } catch (error) {
        console.error('Error al verificar estado de favorito:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFavoriteStatus();
  }, [vehicleId, isAuthenticated]);

  const handleClick = async (e) => {
    e.preventDefault(); // Prevenir navegación si el botón está dentro de un enlace
    e.stopPropagation(); // Evitar que el click se propague

    if (!isAuthenticated) {
      toast.info('Debes iniciar sesión para añadir favoritos');
      navigate('/login', { state: { from: location } });
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await apiClient.delete(`/users/favorites/${vehicleId}`);
        toast.success('Vehículo eliminado de favoritos');
      } else {
        await apiClient.post('/users/favorites', { vehicleId });
        toast.success('Vehículo añadido a favoritos');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast.error('Error al actualizar favoritos');
      console.error('Error al actualizar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
      disabled={loading}
      title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default AddToFavoritesButton; 