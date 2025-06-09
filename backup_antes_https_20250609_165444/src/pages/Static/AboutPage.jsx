import React from 'react';
import { FaCar, FaUsers, FaChartLine, FaLightbulb } from 'react-icons/fa';
import './StaticPages.css';

const AboutPage = () => {
  return (
    <div className="static-page">
      <div className="static-container">
        <div className="static-header">
          <h1>Sobre Nosotros</h1>
          <p className="static-subtitle">
            Tu guía definitiva para comparar y elegir el vehículo perfecto
          </p>
        </div>

        <div className="static-content">
          <section className="about-intro">
            <h2>¿Quiénes somos?</h2>
            <p>
              Comparativa Vehículos nace de la pasión por el mundo del motor y la necesidad 
              de ofrecer información clara, precisa y actualizada para ayudar a los usuarios 
              a tomar la mejor decisión a la hora de elegir un vehículo.
            </p>
            <p>
              Nuestro proyecto combina datos técnicos detallados, tiempos de circuito reales 
              y especificaciones exhaustivas para crear la plataforma de comparación de 
              vehículos más completa del mercado.
            </p>
          </section>

          <div className="features-grid">
            <div className="feature-card">
              <FaCar className="feature-icon" />
              <h3>Base de Datos Completa</h3>
              <p>
                Información detallada de cientos de vehículos con especificaciones 
                técnicas, tiempos de circuito y datos de rendimiento actualizados.
              </p>
            </div>

            <div className="feature-card">
              <FaChartLine className="feature-icon" />
              <h3>Comparativas Precisas</h3>
              <p>
                Herramientas avanzadas de comparación que te permiten analizar 
                múltiples vehículos lado a lado con métricas detalladas.
              </p>
            </div>

            <div className="feature-card">
              <FaUsers className="feature-icon" />
              <h3>Comunidad Activa</h3>
              <p>
                Plataforma donde los entusiastas del motor pueden crear listas 
                personalizadas, guardar favoritos y compartir conocimientos.
              </p>
            </div>

            <div className="feature-card">
              <FaLightbulb className="feature-icon" />
              <h3>Innovación Constante</h3>
              <p>
                Desarrollo continuo de nuevas funcionalidades basadas en las 
                necesidades de nuestra comunidad de usuarios.
              </p>
            </div>
          </div>

          <section className="mission-section">
            <h2>Nuestra Misión</h2>
            <div className="mission-content">
              <p>
                Democratizar el acceso a información técnica de calidad sobre vehículos, 
                proporcionando herramientas intuitivas que simplifiquen el proceso de 
                selección y comparación.
              </p>
              <p>
                Creemos que cada persona merece tomar decisiones informadas cuando se 
                trata de elegir un vehículo, ya sea por rendimiento, eficiencia, 
                comodidad o cualquier otro criterio importante para ellos.
              </p>
            </div>
          </section>

          <section className="values-section">
            <h2>Nuestros Valores</h2>
            <div className="values-list">
              <div className="value-item">
                <h4>🎯 Precisión</h4>
                <p>Datos exactos y verificados para garantizar comparaciones fiables.</p>
              </div>
              <div className="value-item">
                <h4>🚀 Innovación</h4>
                <p>Tecnología de vanguardia para ofrecer la mejor experiencia de usuario.</p>
              </div>
              <div className="value-item">
                <h4>🔄 Transparencia</h4>
                <p>Información clara y accesible sin sesgos comerciales.</p>
              </div>
              <div className="value-item">
                <h4>👥 Comunidad</h4>
                <p>Construimos junto a nuestra comunidad de entusiastas del motor.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 