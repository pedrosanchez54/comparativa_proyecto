import React from 'react';
import { FaUser, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth(); // Obtiene el objeto 'user' del contexto

  // ProtectedRoute debería prevenir llegar aquí sin estar logueado,
  // pero añadimos una comprobación por robustez.
  if (!user) {
    // Podrías mostrar un spinner o redirigir, pero un mensaje es simple
    return <div className="container user-page"><p>Cargando perfil...</p></div>;
  }

  // NOTA: La fecha de registro ('fecha_registro') no se guarda actualmente
  // en el objeto 'user' de la sesión en el backend (authController.js).
  // Si quisieras mostrarla, necesitarías:
  // 1. Modificar el backend para incluir 'fecha_registro' en la sesión al hacer login.
  // 2. O hacer una llamada API adicional aquí para obtener los detalles completos del usuario.
  // Por simplicidad, la comentaremos por ahora.

  return (
    <div className="container user-page profile-page">
      <h1 className="page-title">Mi Perfil</h1>
      <div className="card profile-card">
        <div className="profile-header" style={{ textAlign: 'center', marginBottom: '25px' }}>
          <FaUser size={80} color="#007bff" /> {/* Icono grande de usuario */}
          <h2 style={{ marginTop: '10px', marginBottom: '5px' }}>{user.nombre}</h2>
          <p style={{ color: '#6c757d', margin: 0 }}>{user.rol === 'admin' ? 'Administrador' : 'Usuario Registrado'}</p>
        </div>
        <div className="profile-info">
          <p><FaEnvelope aria-hidden="true"/> <strong>Email:</strong> <span>{user.email}</span></p>
          {/* <p><FaCalendarAlt aria-hidden="true"/> <strong>Miembro desde:</strong> <span>{format(parseISO(user.fecha_registro), 'PPP', { locale: es })}</span></p> */}
          {/* Placeholder para fecha registro */}
          <p><FaCalendarAlt aria-hidden="true"/> <strong>ID de Usuario:</strong> <span>{user.id}</span></p>

           {/* Sección de Acciones (Ejemplo) */}
           {/* <div className="profile-actions" style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
               <button className="btn btn-secondary btn-sm">Cambiar Contraseña</button>
               <button className="btn btn-danger btn-sm" style={{marginLeft: '10px'}}>Eliminar Cuenta</button>
           </div> */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 