import React from 'react';
import { Link } from 'react-router-dom';
// Importar iconos relevantes
import { FaTachometerAlt, FaCar, FaUsers, FaPlusCircle } from 'react-icons/fa';
import './AdminPages.css'; // Estilos específicos de Admin

const AdminDashboardPage = () => {
  return (
    <div className="container admin-page">
      <h1 className="page-title"><FaTachometerAlt /> Panel de Administración</h1>

      <p style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.1rem', color: '#555' }}>
        Bienvenido al área de administración. Desde aquí puedes gestionar el contenido de la plataforma.
      </p>

      {/* Contenedor de enlaces rápidos */}
      <div className="admin-dashboard-links card">
        {/* Enlace a Gestionar Vehículos */}
        <Link to="/admin/vehicles" className="dashboard-link">
          <FaCar size={35} />
          <span>Gestionar Vehículos</span>
          <small>Ver, editar o eliminar vehículos existentes.</small>
        </Link>

        {/* Enlace a Añadir Nuevo Vehículo */}
         <Link to="/admin/vehicles/new" className="dashboard-link">
             <FaPlusCircle size={35} />
             <span>Añadir Nuevo Vehículo</span>
             <small>Crear una nueva ficha de vehículo.</small>
         </Link>

         {/* Enlace a Gestionar Usuarios (Descomentar si se implementa) */}
        {/*
        <Link to="/admin/users" className="dashboard-link">
          <FaUsers size={35} />
          <span>Gestionar Usuarios</span>
          <small>Ver y administrar usuarios registrados.</small>
        </Link>
        */}

         {/* Podrías añadir más enlaces aquí (ej. gestión de tiempos, imágenes, etc.) */}

      </div>
    </div>
  );
};

export default AdminDashboardPage; 