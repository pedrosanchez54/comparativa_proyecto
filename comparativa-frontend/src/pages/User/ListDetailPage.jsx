import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaList, FaTrash } from 'react-icons/fa';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import BackButton from '../../components/Common/BackButton';
import VehicleCard from '../../components/Vehicles/VehicleCard';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import './ListDetailPage.css';

const ListDetailPage = () => {
  const { id_lista } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    vehicleId: null,
    vehicleName: ''
  });

  useEffect(() => {
    loadList();
  }, [id_lista]);

  const loadList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/users/lists/${id_lista}`);
      const listData = response.data.data || null;
      setList(listData);
    } catch (error) {
      console.error('Error al cargar la lista:', error);
      setError('No se pudo cargar la lista. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVehicle = (vehicleId, vehicleName) => {
    setConfirmModal({
      isOpen: true,
      vehicleId,
      vehicleName
    });
  };

  const confirmRemoveVehicle = async () => {
    try {
      await apiClient.delete(`/users/lists/${id_lista}/vehicles/${confirmModal.vehicleId}`);
      setList(prev => ({
        ...prev,
        vehiculos: (prev.vehiculos || []).filter(v => v.id_vehiculo !== confirmModal.vehicleId)
      }));
      toast.success('Vehículo eliminado de la lista');
    } catch (error) {
      toast.error('Error al eliminar el vehículo de la lista');
      console.error('Error eliminando vehículo de lista:', error);
    } finally {
      setConfirmModal({ isOpen: false, vehicleId: null, vehicleName: '' });
    }
  };

  const cancelRemoveVehicle = () => {
    setConfirmModal({ isOpen: false, vehicleId: null, vehicleName: '' });
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
        <BackButton onClick={() => navigate('/my-lists')} text="Volver a mis listas" />
        <h1><FaList /> {list.nombre}</h1>
        <p>{list.vehiculos?.length || 0} vehículos en esta lista</p>
      </header>

      {list.vehiculos?.length > 0 ? (
        <div className="vehicles-grid">
          {list.vehiculos.map(vehicle => (
            <div key={vehicle.id_vehiculo} className="vehicle-item">
              <VehicleCard vehicle={vehicle} />
              <button
                onClick={() => handleRemoveVehicle(vehicle.id_vehiculo, `${vehicle.marca} ${vehicle.modelo}`)}
                className="remove-vehicle-button"
                title="Eliminar de la lista"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-list">
          <p>No hay vehículos en esta lista.</p>
          <Link to="/vehicles" className="btn btn-primary">
            Explorar Vehículos
          </Link>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onConfirm={confirmRemoveVehicle}
        onCancel={cancelRemoveVehicle}
        title="Eliminar vehículo"
        message={`¿Estás seguro de que quieres eliminar "${confirmModal.vehicleName}" de esta lista?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default ListDetailPage; 