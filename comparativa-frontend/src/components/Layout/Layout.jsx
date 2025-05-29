import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaHeart, FaList, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCar, FaExchangeAlt } from 'react-icons/fa';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const buttonRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && 
          navRef.current && 
          !navRef.current.contains(event.target) &&
          !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      // Calcular el ancho del scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      // Aplicar padding-right al body para compensar el scrollbar
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      // Añadir clase para manejar el overflow
      document.body.classList.add('menu-open');
    } else {
      // Restaurar los estilos originales
      document.body.style.paddingRight = '';
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.style.paddingRight = '';
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="nav-container">
          <Link to="/" className="brand-link">
            Comparativa Vehículos
          </Link>

          <button 
            ref={buttonRef}
            className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label="Menú principal"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
          </button>

          <div 
            className={`menu-overlay ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          />

          <nav 
            ref={navRef}
            className={`main-nav ${isMenuOpen ? 'open' : ''}`}
            aria-hidden={!isMenuOpen}
          >
            <div className="nav-links">
              <Link to="/vehicles" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <FaCar /> Catálogo
              </Link>
              <Link to="/compare" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <FaExchangeAlt /> Comparar
              </Link>
              
              {isAuthenticated ? (
                <div className="user-menu">
                  <span className="user-greeting">Hola, {user.nombre}</span>
                  <div className="user-links">
                    <Link to="/profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaUser /> Mi Perfil
                    </Link>
                    <Link to="/favorites" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaHeart /> Mis Favoritos
                    </Link>
                    <Link to="/my-lists" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      <FaList /> Mis Listas
                    </Link>
                    {user.rol === 'admin' && (
                      <Link to="/admin" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        <FaUser /> Panel Admin
                      </Link>
                    )}
                    <button onClick={handleLogout} className="nav-link logout-button">
                      <FaSignOutAlt /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div className="auth-links">
                  <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <FaSignInAlt /> Iniciar Sesión
                  </Link>
                  <Link to="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    <FaUserPlus /> Registrarse
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Comparativa Vehículos</h3>
            <p>Tu guía definitiva para comparar y elegir el vehículo perfecto</p>
          </div>
          <div className="footer-links">
            <Link to="/about">Sobre Nosotros</Link>
            <Link to="/contact">Contacto</Link>
            <Link to="/privacy">Privacidad</Link>
            <Link to="/terms">Términos</Link>
          </div>
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Comparativa Vehículos. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 