import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaList, FaPlus, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import './AddToListButton.css';

/**
 * Botón para añadir un vehículo a una o varias listas del usuario.
 * @param {object} props - Propiedades.
 * @param {number} props.vehicleId - El ID del vehículo al que se asocia el botón.
 */
const AddToListButton = ({ vehicleId }) => {
  const [lists, setLists] = useState([]);
  const [selectedLists, setSelectedLists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newListName, setNewListName] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar las listas del usuario y verificar en cuáles está el vehículo
  useEffect(() => {
    const loadLists = async () => {
      if (!isAuthenticated || !showModal) return;

      try {
        setLoading(true);
        
        // Cargar todas las listas del usuario
        const listsResponse = await apiClient.get('/users/lists');
        const userLists = listsResponse.data.data || [];
        setLists(Array.isArray(userLists) ? userLists : []);
        
        // Verificar en qué listas ya está este vehículo
        const vehicleListsResponse = await apiClient.get(`/users/lists/vehicle/${vehicleId}`);
        const vehicleListIds = vehicleListsResponse.data.data || [];
        setSelectedLists(Array.isArray(vehicleListIds) ? vehicleListIds : []);
        
      } catch (error) {
        console.error('Error al cargar las listas:', error);
        if (error.response?.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
          navigate('/login', { state: { from: location } });
        } else {
          toast.error('Error al cargar las listas');
        }
        setLists([]);
        setSelectedLists([]);
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, [vehicleId, isAuthenticated, showModal, navigate, location]);

  const handleClick = (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Debes iniciar sesión para gestionar tus listas');
      navigate('/login', { state: { from: location } });
      return;
    }

    setShowModal(true);
  };

  const handleListToggle = async (listId) => {
    try {
      setLoading(true);
      
      if (selectedLists.includes(listId)) {
        await apiClient.delete(`/users/lists/${listId}/vehicles/${vehicleId}`);
        setSelectedLists(prev => prev.filter(id => id !== listId));
        toast.success('Vehículo eliminado de la lista');
      } else {
        await apiClient.post(`/users/lists/${listId}/vehicles/${vehicleId}`, {});
        setSelectedLists(prev => [...prev, listId]);
        toast.success('Vehículo añadido a la lista');
      }
    } catch (error) {
      console.error('Error al actualizar la lista:', error);
      toast.error('Error al actualizar la lista');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      setLoading(true);
      const response = await apiClient.post('/users/lists', { 
        nombre: newListName
      });
      
      const newList = response.data.data;
      setLists(prev => Array.isArray(prev) ? [...prev, newList] : [newList]);
      
      // Ahora añadir el vehículo a la nueva lista
      await apiClient.post(`/users/lists/${newList.id}/vehicles/${vehicleId}`, {});
      setSelectedLists(prev => [...prev, newList.id]);
      
      setNewListName('');
      toast.success('Lista creada y vehículo añadido correctamente');
    } catch (error) {
      console.error('Error al crear la lista:', error);
      toast.error('Error al crear la lista');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="list-button"
        title="Añadir a una lista"
      >
        <FaList />
      </button>

      {showModal && createPortal(
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="list-modal" onClick={e => e.stopPropagation()}>
            <h3>Añadir a lista</h3>
            
            <form onSubmit={handleCreateList} className="new-list-form">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Nombre de la nueva lista"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !newListName.trim()}>
                <FaPlus /> Crear Lista
              </button>
            </form>

            <div className="lists-container">
              {loading ? (
                <p>Cargando listas...</p>
              ) : lists.length === 0 ? (
                <p>No tienes listas creadas</p>
              ) : (
                lists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => handleListToggle(list.id)}
                    className={`list-item ${selectedLists.includes(list.id) ? 'selected' : ''}`}
                    disabled={loading}
                  >
                    {list.nombre}
                    {selectedLists.includes(list.id) && <FaCheck className="check-icon" />}
                  </button>
                ))
              )}
            </div>

            <button 
              className="close-button"
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AddToListButton; 