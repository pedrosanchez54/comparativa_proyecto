import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Para enlazar a detalles de lista
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import { FaPlus, FaEye, FaEdit, FaTrash, FaLock, FaUnlock, FaListAlt } from 'react-icons/fa'; // Iconos
import { format, parseISO } from 'date-fns'; // Formatear fechas
import { es } from 'date-fns/locale'; // Formato español
import { toast } from 'react-toastify'; // Notificaciones
import './UserPages.css'; // Estilos comunes

const MyListsPage = () => {
  const [lists, setLists] = useState([]); // Estado para las listas del usuario
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const [error, setError] = useState(null); // Error al cargar listas
  const [showCreateForm, setShowCreateForm] = useState(false); // Mostrar/ocultar formulario de creación
  // Estado para el formulario de nueva lista
  const [newList, setNewList] = useState({ nombre_lista: '', descripcion: '', es_publica: false });
  const [loadingCreate, setLoadingCreate] = useState(false); // Estado de carga para la creación
  const [createError, setCreateError] = useState(null); // Error específico del formulario de creación

  // Función para cargar las listas del usuario
  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/lists'); // Endpoint del backend
      setLists(response.data.data || []);
    } catch (err) {
      setError('Error al cargar tus listas.');
      console.error("Error fetching lists:", err.response?.data || err.message);
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect para cargar las listas al montar el componente
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Manejador para los inputs del formulario de creación
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewList(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejador para enviar el formulario de creación
  const handleCreateList = async (e) => {
    e.preventDefault();
    // Validación simple en frontend
    if (!newList.nombre_lista.trim()) {
        toast.warn('El nombre de la lista no puede estar vacío.');
        return;
    }
    setLoadingCreate(true);
    setCreateError(null); // Limpiar error previo del formulario
    try {
        await apiClient.post('/lists', newList); // Llama a la API para crear
        setNewList({ nombre_lista: '', descripcion: '', es_publica: false }); // Resetear formulario
        setShowCreateForm(false); // Ocultar formulario
        toast.success('Lista creada con éxito.');
        fetchLists(); // Recargar la lista de listas para mostrar la nueva
    } catch (err) {
        const errMsg = err.response?.data?.message || 'Error al crear la lista.';
        setCreateError(errMsg); // Mostrar error cerca del formulario
        toast.error(errMsg); // Y también como notificación
        console.error("Error creating list:", err.response?.data || err.message);
    } finally {
        setLoadingCreate(false);
    }
  };

  // Manejador para eliminar una lista (con confirmación)
  const handleDeleteList = async (listId, listName) => {
      // Pedir confirmación al usuario
      if (window.confirm(`¿Estás seguro de que quieres eliminar la lista "${listName}"? Esta acción eliminará la lista y todos los vehículos que contiene.`)) {
         try {
            setLoading(true); // Indicar carga general mientras se borra
            await apiClient.delete(`/lists/${listId}`); // Llama a la API para borrar
            toast.success(`Lista "${listName}" eliminada.`);
            fetchLists(); // Recargar listas para quitar la eliminada
         } catch (err) {
             const errorMsg = err.response?.data?.message || 'Error al eliminar la lista.';
             toast.error(errorMsg);
             console.error("Error deleting list:", err.response?.data || err.message);
             setError(errorMsg); // Mostrar error general si falla
             setLoading(false); // Asegurarse de quitar el loading si falla
         }
         // setLoading(false) ya está en el finally de fetchLists si se llama
      }
  };

  // --- Renderizado ---
  if (loading && lists.length === 0) return <LoadingSpinner message="Cargando tus listas..." />; // Spinner inicial
  // Mostrar error general si falló la carga inicial
  if (error && lists.length === 0) return <div className="container user-page"><ErrorMessage message={error} /></div>;

  if (!loading && lists.length === 0 && !showCreateForm) {
    return (
      <div className="container user-page">
        <h1 className="page-title">Mis Listas de Comparación</h1>
        <button onClick={() => { setShowCreateForm(!showCreateForm); setCreateError(null); }} className="btn btn-primary mb-3">
          <FaPlus /> Crear Nueva Lista
        </button>
        <div className="no-results card text-center">
          <FaListAlt size={50} color="#ccc" />
          <p>Aún no has creado ninguna lista.</p>
          <p>Usa el botón de arriba para crear tu primera lista de comparación.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container user-page">
      <h1 className="page-title">Mis Listas de Comparación</h1>

      {/* Botón para mostrar/ocultar el formulario de creación */}
      <button onClick={() => { setShowCreateForm(!showCreateForm); setCreateError(null); }} className="btn btn-primary mb-3">
        <FaPlus /> {showCreateForm ? 'Ocultar Formulario' : 'Crear Nueva Lista'}
      </button>

      {/* Formulario de Creación (condicional) */}
      {showCreateForm && (
        <div className="card create-list-form mb-3">
          <h3><FaListAlt /> Nueva Lista</h3>
           {/* Mostrar error específico de la creación aquí */}
           {createError && <ErrorMessage message={createError} />}
          <form onSubmit={handleCreateList}>
            <div className="form-group">
              <label htmlFor="nombre_lista">Nombre de la Lista (*)</label>
              <input
                type="text"
                id="nombre_lista"
                name="nombre_lista"
                value={newList.nombre_lista}
                onChange={handleInputChange}
                required
                maxLength="100"
                disabled={loadingCreate}
                placeholder="Ej: Compactos Deportivos, SUV Familiares..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="descripcion">Descripción (Opcional)</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={newList.descripcion}
                onChange={handleInputChange}
                maxLength="500"
                rows="3"
                disabled={loadingCreate}
                placeholder="Añade una breve descripción sobre esta lista..."
              ></textarea>
            </div>
            {/* Checkbox para lista pública (descomentar si se implementa) */}
            {/* <div className="form-group form-check" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <input
                type="checkbox"
                id="es_publica"
                name="es_publica"
                checked={newList.es_publica}
                onChange={handleInputChange}
                className="form-check-input" // Necesitarás estilos para esto
                 disabled={loadingCreate}
              />
              <label htmlFor="es_publica" className="form-check-label" style={{marginBottom: 0}}>Hacer esta lista pública (visible para otros)</label>
            </div> */}
            <button type="submit" className="btn btn-success" disabled={loadingCreate}>
              {loadingCreate ? 'Creando...' : 'Guardar Lista'}
            </button>
             <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-secondary" style={{marginLeft: '10px'}} disabled={loadingCreate}>
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Mostrar listas existentes o mensaje si no hay */}
      {loading && lists.length === 0 ? (
          <LoadingSpinner message="Cargando..."/>
      ) : lists.length > 0 ? (
        <div className="lists-container">
          {/* Mapear las listas y renderizar una tarjeta para cada una */}
          {lists.map((list) => (
            <div key={list.id_lista} className="list-card">
              {/* Contenido principal de la tarjeta */}
              <div>
                  <h3>{list.nombre_lista}</h3>
                  <p className="list-description">{list.descripcion || 'Sin descripción.'}</p>
              </div>
              {/* Información y botones de acción */}
              <div>
                  <div className='list-info'>
                      <span>{list.vehicle_count || 0} vehículo(s)</span>
                      {/* Icono de pública/privada */}
                      <span>{list.es_publica ? <><FaUnlock/> Pública</> : <><FaLock/> Privada</>}</span>
                      {/* Fecha formateada */}
                      <span title={`Creada: ${format(parseISO(list.fecha_creacion), 'PPPp', { locale: es })}`}>
                          Actualizado: {format(parseISO(list.fecha_actualizacion), 'dd/MM/yy HH:mm')}
                      </span>
                  </div>
                  <div className="list-actions">
                    {/* Enlace a la página de detalle de la lista */}
                    <Link to={`/my-lists/${list.id_lista}`} className="btn btn-primary btn-sm"><FaEye/> Ver Contenido</Link>
                    {/* Botón Editar (funcionalidad pendiente) */}
                    {/* <button className="btn btn-secondary btn-sm" onClick={() => { /* Lógica editar... */ /*}}><FaEdit/> Editar</button> */}
                    {/* Botón Eliminar */}
                    <button onClick={() => handleDeleteList(list.id_lista, list.nombre_lista)} className="btn btn-danger btn-sm"><FaTrash/> Eliminar</button>
                  </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showCreateForm ? (
          <div className="no-results card text-center">
            <FaListAlt size={50} color="#ccc" />
            <p>Aún no has creado ninguna lista.</p>
            <p>Usa el botón de arriba para crear tu primera lista de comparación.</p>
          </div>
        ) : null
      )}
    </div>
  );
};

export default MyListsPage; 