import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCompare } from '../../contexts/CompareContext';
import { FaUser, FaHeart, FaList, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCar, FaExchangeAlt, FaPowerOff } from 'react-icons/fa';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { compareList, removeVehicle, clearCompare } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showComparePopover, setShowComparePopover] = useState(false);
  const navRef = useRef(null);
  const buttonRef = useRef(null);
  const compareIconRef = useRef(null);
  const prevCompareLength = useRef(compareList.length);

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

  useEffect(() => {
    if (
      compareList.length > prevCompareLength.current &&
      compareIconRef.current
    ) {
      compareIconRef.current.classList.add('compare-appear');
      const timer = setTimeout(() => {
        if (compareIconRef.current) {
          compareIconRef.current.classList.remove('compare-appear');
        }
      }, 900);
      prevCompareLength.current = compareList.length;
      return () => clearTimeout(timer);
    }
    prevCompareLength.current = compareList.length;
  }, [compareList.length]);

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="nav-container">
          <Link to="/" className="brand-link">
            Comparativa Vehículos
          </Link>

          {/* Nuevo contenedor para agrupar acciones de la derecha (comparativa y menú hamburguesa) */}
          <div className="nav-actions-cluster">
            {/* Icono de Comparativa Rápida (Visible si hay items) */}
            {compareList.length > 0 && (
              <div 
                className="compare-header-icon-wrapper" 
                ref={compareIconRef}
                onMouseEnter={() => setShowComparePopover(true)}
                onMouseLeave={() => setShowComparePopover(false)}
              >
                <button 
                  className="compare-header-icon" 
                  onClick={() => { 
                    navigate('/compare', { 
                      state: { vehicleIds: compareList.map(v => v.id_vehiculo) } 
                    }); 
                    setShowComparePopover(false); 
                  }}
                  title="Ir a la página de comparación"
                >
                  <img src="/img/iconos/icono_comparativo.png" alt="" aria-hidden="true" focusable="false" className="compare-main-icon" />
                  <span className="compare-badge">{compareList.length}</span>
                </button>
                {showComparePopover && (
                  <div className="compare-popover">
                    {compareList.length > 0 ? (
                      <>
                        <ul>
                          {compareList.map(v => (
                            <li key={v.id_vehiculo}>
                              <img 
                                src={v.imagen_principal || '/placeholder-image.png'} 
                                alt={`${v.marca} ${v.modelo}`}
                                className="compare-popover-vehicle-img"
                              />
                              <span className="compare-popover-vehicle-name">{v.marca} {v.modelo} {v.version ? `- ${v.version}` : ''}</span>
                              <button 
                                onClick={() => removeVehicle(v.id_vehiculo)} 
                                className="compare-popover-remove-btn"
                                title="Quitar de la comparativa"
                              >
                                &times;
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className="compare-popover-actions">
                          <button className="compare-popover-btn clear" onClick={clearCompare}>
                            Vaciar Lista
                          </button>
                          <button 
                            className="compare-popover-btn go-to-compare" 
                            onClick={() => { 
                              navigate('/compare', { 
                                state: { vehicleIds: compareList.map(v => v.id_vehiculo) } 
                              }); 
                              setShowComparePopover(false); 
                            }}
                          >
                            Comparar
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="compare-popover-empty">Añade vehículos para comparar.</p>
                    )}
                  </div>
                )}
              </div>
            )}

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
          </div> {/* Fin de nav-actions-cluster */}

          <div 
            className={`menu-overlay ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          />

          <nav 
            ref={navRef}
            className={`main-nav ${isMenuOpen ? 'open' : ''}`}
            aria-hidden={!isMenuOpen}
          >
            <div className="nav-content">
              <div className="nav-links">
                <Link to="/vehicles" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <FaCar /> Catálogo
                </Link>
                <Link to="/compare" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <FaExchangeAlt /> Comparar
                </Link>
                
                {isAuthenticated ? (
                  <div className="nav-user-links">
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

              {/* Información del usuario en la parte inferior */}
              {isAuthenticated && (
                <div className="nav-user-section">
                  <div 
                    className="user-info"
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                  >
                    <div className="user-avatar">
                      <FaUser />
                    </div>
                    <div className="user-details">
                      <span className="user-name">{user.nombre}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="logout-button" title="Cerrar sesión">
                    <FaSignOutAlt />
                  </button>
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