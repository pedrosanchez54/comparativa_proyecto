import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaChartBar, FaUserPlus } from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  return (
    <>
      <div
        className="background-nurburgring"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: `linear-gradient(rgba(20,20,20,0.7), rgba(20,20,20,0.7)), url('/img/backgrounds/Nurburgring2.jpeg') center center / cover no-repeat`,
          pointerEvents: 'none',
        }}
      />
      <div className="home-page">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Bienvenido a ComparativaApp
            </h1>
            <p className="hero-subtitle">
              Tu plataforma definitiva para explorar, comparar y guardar especificaciones de vehículos.
            </p>
            <div className="hero-actions">
              <Link to="/compare" className="btn btn-primary">
                <FaChartBar /> Ir a Comparativas
              </Link>
              <Link to="/vehicles" className="btn btn-secondary">
                <FaCar /> Explorar Catálogo
              </Link>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaCar />
              </div>
              <h3>Explora el Catálogo</h3>
              <p>Navega por nuestro extenso catálogo y descubre detalles técnicos de cada vehículo.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaChartBar />
              </div>
              <h3>Compara Modelos</h3>
              <p>Compara diferentes modelos lado a lado para tomar la mejor decisión.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaUserPlus />
              </div>
              <h3>Crea tu Cuenta</h3>
              <p>Guarda tus favoritos y crea listas personalizadas de comparación.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>¿Listo para empezar?</h2>
            <p className="cta-description-blanca">Únete a nuestra comunidad y descubre todas las funcionalidades.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">
                Regístrate Gratis
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Inicia Sesión
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage; 