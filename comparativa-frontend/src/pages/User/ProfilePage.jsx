import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaCalendarAlt, FaHeart, FaList, FaCar, FaTachometerAlt, FaCogs, FaChartLine, FaEdit, FaSignOutAlt, FaStar, FaEye, FaTimes, FaSave, FaLock, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ConfirmModal from '../../components/Common/ConfirmModal';
import useConfirmModal from '../../hooks/useConfirmModal';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, setUserData } = useAuth();
  const [stats, setStats] = useState({
    favoritesCount: 0,
    listsCount: 0,
    recentFavorites: [],
    recentLists: []
  });
  const [loading, setLoading] = useState(true);
  
  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [editMode, setEditMode] = useState('profile'); // 'profile' o 'password'

  // Hook del modal de confirmación
  const {
    isOpen: isConfirmOpen,
    modalConfig,
    loading: confirmLoading,
    openConfirmModal,
    closeConfirmModal,
    confirm
  } = useConfirmModal();

  // Cargar estadísticas del usuario
  useEffect(() => {
    if (user) {
      loadUserStats();
      // Inicializar el formulario con los datos del usuario
      setEditForm(prev => ({
        ...prev,
        nombre: user.nombre || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      
      // Cargar favoritos
      const favoritesResponse = await apiClient.get('/users/favorites');
      const favorites = favoritesResponse.data.data || [];
      
      // Cargar listas
      const listsResponse = await apiClient.get('/users/lists');
      const lists = listsResponse.data.data || [];
      
      setStats({
        favoritesCount: favorites.length,
        listsCount: lists.length,
        recentFavorites: favorites.slice(0, 3), // Últimos 3 favoritos
        recentLists: lists.slice(0, 3) // Últimas 3 listas
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar las estadísticas del perfil');
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha de registro
  const formatRegistrationDate = (dateString) => {
    if (!dateString) return 'No disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'No disponible';
    }
  };

  const handleLogout = () => {
    openConfirmModal({
      title: "Cerrar Sesión",
      message: "¿Estás seguro de que quieres cerrar sesión?",
      confirmText: "Cerrar Sesión",
      cancelText: "Cancelar",
      type: "warning",
      onConfirm: () => confirm(async () => {
        logout();
      })
    });
  };

  // Funciones para el modal de edición
  const openEditModal = () => {
    setEditForm({
      nombre: user.nombre || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setEditMode('profile');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditForm({
      nombre: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!editForm.nombre.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }

    if (!editForm.email.trim()) {
      toast.error('El correo electrónico es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast.error('Correo electrónico inválido');
      return false;
    }

    if (!editForm.currentPassword.trim()) {
      toast.error('La contraseña actual es requerida para confirmar los cambios');
      return false;
    }

    if (editMode === 'password') {
      if (!editForm.newPassword.trim()) {
        toast.error('La nueva contraseña es requerida');
        return false;
      }

      if (editForm.newPassword.length < 8) {
        toast.error('La nueva contraseña debe tener al menos 8 caracteres');
        return false;
      }

      if (editForm.newPassword !== editForm.confirmPassword) {
        toast.error('Las contraseñas nuevas no coinciden');
        return false;
      }
    }

    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    try {
      setEditLoading(true);

      if (editMode === 'profile') {
        // Actualizar perfil
        const response = await apiClient.put('/users/profile', {
          nombre: editForm.nombre,
          email: editForm.email,
          currentPassword: editForm.currentPassword
        });

        // Actualizar el contexto con los nuevos datos
        const updatedUser = { ...user, ...response.data };
        setUserData(updatedUser);
        
        toast.success('Perfil actualizado correctamente');
      } else {
        // Cambiar contraseña
        await apiClient.put('/users/password', {
          currentPassword: editForm.currentPassword,
          newPassword: editForm.newPassword
        });

        toast.success('Contraseña cambiada correctamente');
      }

      closeEditModal();
      
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      const message = error.response?.data?.message || 'Error al actualizar el perfil';
      toast.error(message);
    } finally {
      setEditLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner message="Cargando perfil..." />;
  }

  return (
    <div className="profile-page-modern">
      <div className="profile-container">
        {/* Header del perfil */}
        <div className="profile-header-card">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <div className="profile-main-info">
            <h1 className="profile-name">{user.nombre}</h1>
            <div className="profile-role">
              {user.rol === 'admin' ? (
                <span className="role-badge admin">
                  <FaCogs /> Administrador
                </span>
              ) : (
                <span className="role-badge user">
                  <FaUser /> Usuario Registrado
                </span>
              )}
            </div>
            <div className="profile-basic-info">
              <div className="info-item">
                <FaEnvelope />
                <span>{user.email}</span>
              </div>
              <div className="email-note">
                <small>
                  ℹ️ El correo puede aparecer en formato normalizado por seguridad
                </small>
              </div>
              <div className="info-item">
                <FaCalendarAlt />
                <span>Miembro desde {user.fecha_registro ? formatRegistrationDate(user.fecha_registro) : 'No disponible'}</span>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button className="action-btn secondary" onClick={openEditModal}>
              <FaEdit /> Editar Perfil
            </button>
            <button className="action-btn logout" onClick={handleLogout}>
              <FaSignOutAlt /> Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Estadísticas del usuario */}
        <div className="profile-stats-section">
          <h2 className="section-title">
            <FaChartLine /> Estadísticas
          </h2>
          
          {loading ? (
            <div className="stats-loading">
              <LoadingSpinner message="Cargando estadísticas..." />
            </div>
          ) : (
            <div className="stats-grid">
              <Link to="/favorites" className="stat-card favorites">
                <div className="stat-icon">
                  <FaHeart />
                </div>
                <div className="stat-content">
                  <span className="stat-number">{stats.favoritesCount}</span>
                  <span className="stat-label">Favoritos</span>
                </div>
                <div className="stat-arrow">
                  <FaEye />
                </div>
              </Link>

              <Link to="/my-lists" className="stat-card lists">
                <div className="stat-icon">
                  <FaList />
                </div>
                <div className="stat-content">
                  <span className="stat-number">{stats.listsCount}</span>
                  <span className="stat-label">Listas</span>
                </div>
                <div className="stat-arrow">
                  <FaEye />
                </div>
              </Link>

              <div className="stat-card vehicles">
                <div className="stat-icon">
                  <FaCar />
                </div>
                <div className="stat-content">
                  <span className="stat-number">{stats.favoritesCount + stats.recentLists.reduce((acc, list) => acc + (list.vehicle_count || 0), 0)}</span>
                  <span className="stat-label">Vehículos Guardados</span>
                </div>
              </div>

              <div className="stat-card activity">
                <div className="stat-icon">
                  <FaTachometerAlt />
                </div>
                <div className="stat-content">
                  <span className="stat-number">{stats.favoritesCount > 0 ? 'Activo' : 'Nuevo'}</span>
                  <span className="stat-label">Estado</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="profile-activity-section">
          <div className="activity-grid">
            {/* Favoritos recientes */}
            <div className="activity-card">
              <div className="activity-header">
                <h3>
                  <FaHeart /> Favoritos Recientes
                </h3>
                <Link to="/favorites" className="view-all-link">
                  Ver todos ({stats.favoritesCount})
                </Link>
              </div>
              <div className="activity-content">
                {stats.recentFavorites.length > 0 ? (
                  <div className="recent-items">
                    {stats.recentFavorites.map((favorite) => (
                      <Link 
                        key={favorite.id_vehiculo} 
                        to={`/vehicles/${favorite.id_vehiculo}`}
                        className="recent-item"
                      >
                        <div className="recent-item-image">
                          {favorite.imagen_principal ? (
                            <img 
                              src={favorite.imagen_principal} 
                              alt={`${favorite.marca} ${favorite.modelo}`}
                              onError={(e) => { 
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="image-placeholder" style={{ display: favorite.imagen_principal ? 'none' : 'flex' }}>
                            <FaCar />
                          </div>
                        </div>
                        <div className="recent-item-info">
                          <span className="item-name">{favorite.marca} {favorite.modelo}</span>
                          <span className="item-detail">{favorite.version || favorite.motorizacion} ({favorite.anio})</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaHeart />
                    <p>No tienes favoritos aún</p>
                    <Link to="/vehicles" className="cta-link">Explorar vehículos</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Listas recientes */}
            <div className="activity-card">
              <div className="activity-header">
                <h3>
                  <FaList /> Listas Recientes
                </h3>
                <Link to="/my-lists" className="view-all-link">
                  Ver todas ({stats.listsCount})
                </Link>
              </div>
              <div className="activity-content">
                {stats.recentLists.length > 0 ? (
                  <div className="recent-items">
                    {stats.recentLists.map((list) => (
                      <Link 
                        key={list.id} 
                        to={`/my-lists/${list.id}`}
                        className="recent-item list-item"
                      >
                        <div className="recent-item-icon">
                          <FaList />
                        </div>
                        <div className="recent-item-info">
                          <span className="item-name">{list.nombre}</span>
                          <span className="item-detail">{list.vehicle_count || 0} vehículos</span>
                        </div>
                        <div className="item-status">
                          {list.es_publica ? <FaStar title="Lista pública" /> : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaList />
                    <p>No tienes listas creadas aún</p>
                    <Link to="/my-lists" className="cta-link">Crear primera lista</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="profile-quick-actions">
          <h2 className="section-title">Acciones Rápidas</h2>
          <div className="quick-actions-grid">
            <Link to="/vehicles" className="quick-action">
              <FaCar />
              <span>Explorar Catálogo</span>
            </Link>
            <Link to="/comparison" className="quick-action">
              <FaTachometerAlt />
              <span>Nueva Comparativa</span>
            </Link>
            <Link to="/my-lists" className="quick-action">
              <FaList />
              <span>Gestionar Listas</span>
            </Link>
            <Link to="/favorites" className="quick-action">
              <FaHeart />
              <span>Ver Favoritos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal de edición de perfil */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FaEdit /> Editar Perfil
              </h2>
              <button className="modal-close" onClick={closeEditModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-tabs">
              <button 
                className={`modal-tab ${editMode === 'profile' ? 'active' : ''}`}
                onClick={() => setEditMode('profile')}
              >
                <FaUser /> Información Personal
              </button>
              <button 
                className={`modal-tab ${editMode === 'password' ? 'active' : ''}`}
                onClick={() => setEditMode('password')}
              >
                <FaLock /> Cambiar Contraseña
              </button>
            </div>

            <div className="modal-body">
              {editMode === 'profile' ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label htmlFor="nombre">
                      <FaUser /> Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={editForm.nombre}
                      onChange={handleEditFormChange}
                      placeholder="Tu nombre completo"
                      disabled={editLoading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <FaEnvelope /> Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditFormChange}
                      placeholder="tu@email.com"
                      disabled={editLoading}
                      required
                    />
                    <div className="form-help-text">
                      <small>
                        ℹ️ Tu correo puede aparecer sin puntos o con formato normalizado por seguridad.
                        Esto no afecta la funcionalidad y ambos formatos funcionan igual (ej: tu.email@gmail.com y tuemail@gmail.com).
                      </small>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="currentPassword">
                      <FaLock /> Contraseña Actual (para confirmar cambios)
                    </label>
                    <div className="password-input">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={editForm.currentPassword}
                        onChange={handleEditFormChange}
                        placeholder="Tu contraseña actual"
                        disabled={editLoading}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="edit-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">
                      <FaLock /> Contraseña Actual
                    </label>
                    <div className="password-input">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={editForm.currentPassword}
                        onChange={handleEditFormChange}
                        placeholder="Tu contraseña actual"
                        disabled={editLoading}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">
                      <FaLock /> Nueva Contraseña
                    </label>
                    <div className="password-input">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={editForm.newPassword}
                        onChange={handleEditFormChange}
                        placeholder="Nueva contraseña (mín. 8 caracteres)"
                        disabled={editLoading}
                        required
                        minLength="8"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      <FaLock /> Confirmar Nueva Contraseña
                    </label>
                    <div className="password-input">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={editForm.confirmPassword}
                        onChange={handleEditFormChange}
                        placeholder="Repite la nueva contraseña"
                        disabled={editLoading}
                        required
                        minLength="8"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn secondary" 
                onClick={closeEditModal}
                disabled={editLoading}
              >
                Cancelar
              </button>
              <button 
                className="modal-btn primary" 
                onClick={handleSaveChanges}
                disabled={editLoading}
              >
                {editLoading ? (
                  <>
                    <LoadingSpinner /> Guardando...
                  </>
                ) : (
                  <>
                    <FaSave /> Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
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

export default ProfilePage; 