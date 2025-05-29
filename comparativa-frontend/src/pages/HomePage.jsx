import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaChartBar, FaUserPlus } from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Bienvenido a ComparativaApp
          </h1>
          <p className="hero-subtitle">
          Tu plataforma definitiva para explorar, comparar y guardar especificaciones de vehículos.
        </p>
          <div className="hero-actions">
            <Link to="/vehicles" className="btn btn-primary">
              <FaCar /> Explorar Catálogo
          </Link>
            <Link to="/compare" className="btn btn-secondary">
              <FaChartBar /> Ir a Comparativas
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
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
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>¿Listo para empezar?</h2>
            <p>Únete a nuestra comunidad y descubre todas las funcionalidades.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">
                Regístrate Gratis
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Inicia Sesión
              </Link>
            </div>
          </div>
        </div>
       </section>
    </div>
  );
};

export default HomePage; 