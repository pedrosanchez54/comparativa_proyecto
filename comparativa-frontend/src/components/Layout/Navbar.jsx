import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCompare } from '../../contexts/CompareContext';
// Importa los iconos que usarás
import { FaCar, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaHeart, FaList, FaTools, FaHome, FaExchangeAlt, FaCarSide } from 'react-icons/fa';
import './Navbar.css'; // Importa los estilos CSS para este componente
import CompareCarsIcon from '../Common/CompareCarsIcon';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth(); // Obtiene estado y funciones del contexto de autenticación
  const navigate = useNavigate(); // Hook para navegar programáticamente
  const { compareList, removeVehicle, clearCompare } = useCompare();
  const [showPopover, setShowPopover] = React.useState(false);
  const iconRef = React.useRef();

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    await logout(); // Llama a la función logout del contexto
    navigate('/'); // Redirige a la página principal después del logout
  };

  // Clase helper para los NavLinks activos
  const getNavLinkClass = ({ isActive }) => "nav-links" + (isActive ? " active" : "");

  // Animación de aparición
  React.useEffect(() => {
    if (compareList.length === 1 && iconRef.current) {
      iconRef.current.classList.add('compare-appear');
      setTimeout(() => iconRef.current.classList.remove('compare-appear'), 900);
    }
  }, [compareList.length]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Título de la App - Enlace a la Home */}
        <Link to="/" className="navbar-logo">
          <FaCar /> ComparativaApp
        </Link>

        {/* Menú de Navegación Principal (Izquierda/Centro) */}
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink to="/" className={getNavLinkClass} end> {/* 'end' para que no esté activo en subrutas */}
              <FaHome /> Inicio
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/vehicles" className={getNavLinkClass}>
              <FaCar /> Vehículos
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/compare" className={getNavLinkClass}>
              <FaExchangeAlt /> Comparativa
            </NavLink>
          </li>
          {/* Puedes añadir más enlaces públicos aquí (ej. /about, /contact) */}
        </ul>

        {/* Menú de Usuario/Acciones (Derecha) */}
        <ul className="nav-menu nav-menu-right">
          {isLoggedIn ? (
            // --- Menú si el usuario ESTÁ logueado ---
            <>
              {/* Enlace al Panel de Admin (solo si el usuario es admin) */}
              {user?.rol === 'admin' && (
                 <li className="nav-item">
                   <NavLink to="/admin" className={getNavLinkClass}>
                     <FaTools /> Admin
                   </NavLink>
                 </li>
              )}
              {/* Enlace a Favoritos */}
               <li className="nav-item">
                 <NavLink to="/favorites" className={getNavLinkClass}>
                   <FaHeart /> Favoritos
                 </NavLink>
               </li>
               {/* Enlace a Mis Listas */}
                <li className="nav-item">
                 <NavLink to="/my-lists" className={getNavLinkClass}>
                   <FaList /> Mis Listas
                 </NavLink>
               </li>
               {/* Saludo al Usuario y Enlace a Perfil */}
               <li className="nav-item">
                  <NavLink to="/profile" className={getNavLinkClass}>
                     <FaUser /> {user?.nombre || 'Perfil'} {/* Muestra nombre o 'Perfil' */}
                  </NavLink>
               </li>
               {/* Botón de Cerrar Sesión */}
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-links button">
                  <FaSignOutAlt /> Salir
                </button>
              </li>
            </>
          ) : (
            // --- Menú si el usuario NO está logueado ---
            <>
              {/* Enlace a Iniciar Sesión */}
              <li className="nav-item">
                <NavLink to="/login" className={getNavLinkClass}>
                  <FaSignInAlt /> Entrar
                </NavLink>
              </li>
              {/* Enlace a Registro */}
              <li className="nav-item">
                <NavLink to="/register" className={getNavLinkClass}>
                  <FaUserPlus /> Registro
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-actions">
          <div
            className="compare-header-icon-wrapper"
            ref={iconRef}
            onMouseEnter={() => setShowPopover(true)}
            onMouseLeave={() => setShowPopover(false)}
          >
            <button className="compare-header-icon" onClick={() => navigate('/compare')}>
              <span className="compare-icon-cars">
                <CompareCarsIcon selected={compareList.length > 0} />
              </span>
              {compareList.length > 0 && (
                <span className="compare-badge">{compareList.length}</span>
              )}
            </button>
            {showPopover && compareList.length > 0 && (
              <div className="compare-popover">
                <ul>
                  {compareList.map(v => (
                    <li key={v.id_vehiculo}>
                      <img src={v.imagen_principal || '/placeholder-image.png'} alt={v.modelo} />
                      <span>{v.marca} {v.modelo} {v.version}</span>
                      <button onClick={() => removeVehicle(v.id_vehiculo)}>&times;</button>
                    </li>
                  ))}
                </ul>
                <button className="clear-compare-btn" onClick={clearCompare}>Vaciar lista</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 