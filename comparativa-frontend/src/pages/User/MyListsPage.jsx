import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaList, FaPlus, FaTrash, FaPen, FaCheck, FaTimes } from 'react-icons/fa';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import ConfirmModal from '../../components/Common/ConfirmModal';
import useConfirmModal from '../../hooks/useConfirmModal';
import './MyListsPage.css';

const MyListsPage = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editingName, setEditingName] = useState('');
  
  // Hook del modal de confirmación
  const {
    isOpen: isConfirmOpen,
    modalConfig,
    loading: confirmLoading,
    openConfirmModal,
    closeConfirmModal,
    confirm
  } = useConfirmModal();

  // Cargar listas al montar el componente
  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/users/lists');
      const listsData = response.data.data || [];
      setLists(Array.isArray(listsData) ? listsData : []);
    } catch (error) {
      console.error('Error al cargar listas:', error);
      setError('No se pudieron cargar tus listas. Por favor, inténtalo de nuevo más tarde.');
      setLists([]); // Asegurar que lists sea siempre un array
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      setLoading(true);
      const response = await apiClient.post('/users/lists', { nombre: newListName });
      const newList = response.data.data;
      setLists(prev => Array.isArray(prev) ? [...prev, newList] : [newList]);
      setNewListName('');
      toast.success('Lista creada correctamente');
    } catch (error) {
      toast.error('Error al crear la lista');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId, listName) => {
    openConfirmModal({
      title: "Eliminar Lista",
      message: `¿Estás seguro de que quieres eliminar la lista "${listName}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      type: "danger",
      onConfirm: () => confirm(async () => {
        await apiClient.delete(`/users/lists/${listId}`);
        setLists(prev => Array.isArray(prev) ? prev.filter(list => list.id !== listId) : []);
        toast.success('Lista eliminada correctamente');
      })
    });
  };

  const startEditing = (list) => {
    setEditingListId(list.id);
    setEditingName(list.nombre);
  };

  const cancelEditing = () => {
    setEditingListId(null);
    setEditingName('');
  };

  const handleUpdateList = async (listId) => {
    if (!editingName.trim()) return;

    try {
      await apiClient.put(`/users/lists/${listId}`, { nombre: editingName });
      setLists(prev => Array.isArray(prev) ? prev.map(list => 
        list.id === listId ? { ...list, nombre: editingName } : list
      ) : []);
      setEditingListId(null);
      toast.success('Lista actualizada correctamente');
    } catch (error) {
      toast.error('Error al actualizar la lista');
    }
  };

  if (loading && lists.length === 0) {
    return <LoadingSpinner message="Cargando tus listas..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="lists-page">
      <header className="lists-header">
        <h1><FaList /> Mis Listas</h1>
        <p>Crea y gestiona tus listas de vehículos para comparar.</p>
      </header>

      <form onSubmit={handleCreateList} className="create-list-form">
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

      {lists.length === 0 ? (
        <div className="empty-lists">
          <p>No tienes listas creadas todavía.</p>
          <p>Crea una lista para empezar a organizar los vehículos que te interesan.</p>
        </div>
      ) : (
        <div className="lists-grid">
          {lists.map(list => (
            <div key={list.id} className="list-card">
              {editingListId === list.id ? (
                <div className="list-edit-form">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Nombre de la lista"
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => handleUpdateList(list.id)}
                      className="save-button"
                      disabled={!editingName.trim()}
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="cancel-button"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{list.nombre}</h3>
                  <p>{list.vehicle_count || 0} vehículos</p>
                  
                  <div className="list-actions">
                    <Link to={`/my-lists/${list.id}`} className="view-button">
                      Ver Lista
                    </Link>
                    <button
                      onClick={() => startEditing(list)}
                      className="edit-button"
                      title="Editar lista"
                    >
                      <FaPen />
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id, list.nombre)}
                      className="delete-button"
                      title="Eliminar lista"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={closeConfirmModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
        loading={confirmLoading}
      />
    </div>
  );
};

export default MyListsPage; 