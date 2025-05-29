import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaList, FaTrash, FaArrowLeft, FaExchangeAlt, FaCarSide } from 'react-icons/fa';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import VehicleCard from '../../components/Vehicles/VehicleCard';
import { useCompare } from '../../contexts/CompareContext';
import CompareCarsIcon from '../../components/Common/CompareCarsIcon';
import './ListDetailPage.css';

const ListDetailPage = () => {
  const { id_lista } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const { compareList, isInCompare, addVehicle, removeVehicle } = useCompare();

  useEffect(() => {
    loadList();
  }, [id_lista]);

  const loadList = async () => {
    try {
    setLoading(true);
    setError(null);
      const response = await apiClient.get(`/users/lists/${id_lista}`);
      setList(response.data);
    } catch (error) {
      console.error('Error al cargar la lista:', error);
      setError('No se pudo cargar la lista. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVehicle = async (vehicleId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este vehículo de la lista?')) return;

    try {
      await apiClient.delete(`/users/lists/${id_lista}/vehicles/${vehicleId}`);
      setList(prev => ({
        ...prev,
        vehiculos: prev.vehiculos.filter(v => v.id_vehiculo !== vehicleId)
      }));
      toast.success('Vehículo eliminado de la lista');
    } catch (error) {
      toast.error('Error al eliminar el vehículo de la lista');
    }
  };

  const handleCompare = () => {
    if (selectedVehicles.size < 2) {
      toast.warn('Selecciona al menos 2 vehículos para comparar');
      return;
    }
    if (selectedVehicles.size > 4) {
      toast.warn('No puedes comparar más de 4 vehículos a la vez');
      return;
    }
    navigate('/compare', { state: { vehicleIds: Array.from(selectedVehicles) } });
  };

  const toggleVehicleSelection = (vehicleId) => {
        setSelectedVehicles(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(vehicleId)) {
        newSelection.delete(vehicleId);
      } else if (newSelection.size < 4) {
        newSelection.add(vehicleId);
      } else {
        toast.warn('No puedes seleccionar más de 4 vehículos para comparar');
      }
      return newSelection;
    });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando lista..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!list) {
    return <ErrorMessage message="No se encontró la lista solicitada." />;
  }

  return (
    <div className="list-detail-page">
      <header className="list-detail-header">
        <Link to="/my-lists" className="back-button">
          <FaArrowLeft /> Volver a mis listas
        </Link>
        <h1><FaList /> {list.nombre}</h1>
        <p>{list.vehiculos?.length || 0} vehículos en esta lista</p>
      </header>

      {list.vehiculos?.length > 0 ? (
        <>
          <div className="compare-section">
            <p>
              {selectedVehicles.size} vehículo{selectedVehicles.size !== 1 ? 's' : ''} seleccionado{selectedVehicles.size !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleCompare}
              disabled={selectedVehicles.size < 2}
              className="compare-button"
            >
              <FaExchangeAlt /> Comparar Seleccionados
            </button>
          </div>

          <div className="vehicles-grid">
            {list.vehiculos.map(vehicle => (
              <div key={vehicle.id_vehiculo} className="vehicle-item">
                <div className="vehicle-select">
                <input
                  type="checkbox"
                    id={`select-${vehicle.id_vehiculo}`}
                  checked={selectedVehicles.has(vehicle.id_vehiculo)}
                    onChange={() => toggleVehicleSelection(vehicle.id_vehiculo)}
                  disabled={!selectedVehicles.has(vehicle.id_vehiculo) && selectedVehicles.size >= 4}
                />
                  <label htmlFor={`select-${vehicle.id_vehiculo}`}>
                    Seleccionar para comparar
                  </label>
                </div>
                <VehicleCard vehicle={vehicle} />
                <button
                  className={`compare-btn${isInCompare(vehicle.id_vehiculo) ? ' selected' : ''}`}
                  onClick={() => isInCompare(vehicle.id_vehiculo) ? removeVehicle(vehicle.id_vehiculo) : addVehicle(vehicle)}
                  disabled={compareList.length >= 6 && !isInCompare(vehicle.id_vehiculo)}
                  title={isInCompare(vehicle.id_vehiculo) ? 'Quitar de comparativa' : compareList.length >= 6 ? 'Máximo 6 vehículos' : 'Añadir a comparativa'}
                >
                  <CompareCarsIcon selected={isInCompare(vehicle.id_vehiculo)} />
                </button>
                <button
                  onClick={() => handleRemoveVehicle(vehicle.id_vehiculo)}
                  className="remove-vehicle-button"
                  title="Eliminar de la lista"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-list">
          <p>No hay vehículos en esta lista.</p>
          <Link to="/vehicles" className="btn btn-primary">
            Explorar Vehículos
          </Link>
        </div>
      )}
    </div>
  );
};

export default ListDetailPage; 