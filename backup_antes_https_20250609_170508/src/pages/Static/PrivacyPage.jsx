import React from 'react';
import { FaShieldAlt, FaLock, FaUserCheck, FaDatabase } from 'react-icons/fa';
import './StaticPages.css';

const PrivacyPage = () => {
  return (
    <div className="static-page">
      <div className="static-container">
        <div className="static-header">
          <h1>Política de Privacidad</h1>
          <p className="static-subtitle">
            Tu privacidad es importante para nosotros. Conoce cómo protegemos tus datos.
          </p>
          <div className="last-updated">
            <span>Última actualización: Enero 2025</span>
          </div>
        </div>

        <div className="static-content">
          <div className="privacy-intro">
            <div className="security-badges">
              <div className="security-badge">
                <FaShieldAlt className="security-icon" />
                <span>GDPR Compliant</span>
              </div>
              <div className="security-badge">
                <FaLock className="security-icon" />
                <span>Datos Cifrados</span>
              </div>
              <div className="security-badge">
                <FaUserCheck className="security-icon" />
                <span>Control Total</span>
              </div>
            </div>
          </div>

          <section className="privacy-section">
            <h2>1. Información que Recopilamos</h2>
            <p>
              En Comparativa Vehículos, recopilamos únicamente la información necesaria 
              para proporcionarte nuestros servicios de manera eficiente y personalizada.
            </p>
            
            <h3>1.1 Información de Registro</h3>
            <ul>
              <li><strong>Datos personales:</strong> Nombre, email, contraseña cifrada</li>
              <li><strong>Preferencias:</strong> Vehículos favoritos, listas personalizadas</li>
              <li><strong>Actividad:</strong> Historial de comparaciones realizadas</li>
            </ul>

            <h3>1.2 Información Técnica</h3>
            <ul>
              <li><strong>Navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas</li>
              <li><strong>Dispositivo:</strong> Tipo de dispositivo, sistema operativo</li>
              <li><strong>Cookies:</strong> Preferencias de usuario y sesión activa</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>2. Cómo Utilizamos Tu Información</h2>
            <div className="usage-grid">
              <div className="usage-item">
                <FaDatabase className="usage-icon" />
                <h4>Personalización</h4>
                <p>Adaptamos la experiencia según tus preferencias y comportamiento de navegación.</p>
              </div>
              <div className="usage-item">
                <FaLock className="usage-icon" />
                <h4>Seguridad</h4>
                <p>Protegemos tu cuenta y detectamos actividades sospechosas.</p>
              </div>
              <div className="usage-item">
                <FaUserCheck className="usage-icon" />
                <h4>Comunicación</h4>
                <p>Te contactamos para notificaciones importantes y actualizaciones del servicio.</p>
              </div>
              <div className="usage-item">
                <FaShieldAlt className="usage-icon" />
                <h4>Mejoras</h4>
                <p>Analizamos el uso para mejorar nuestros servicios y funcionalidades.</p>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>3. Compartir Información</h2>
            <div className="sharing-policy">
              <div className="policy-item positive">
                <h4>✅ Lo que SÍ hacemos</h4>
                <ul>
                  <li>Proteger tus datos con cifrado de extremo a extremo</li>
                  <li>Permitirte controlar tu privacidad en todo momento</li>
                  <li>Cumplir con todas las regulaciones de protección de datos</li>
                  <li>Ser transparentes sobre nuestras prácticas</li>
                </ul>
              </div>
              <div className="policy-item negative">
                <h4>❌ Lo que NO hacemos</h4>
                <ul>
                  <li>Vender tus datos a terceros</li>
                  <li>Compartir información personal sin tu consentimiento</li>
                  <li>Utilizar tus datos para publicidad externa</li>
                  <li>Almacenar información innecesaria</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>4. Tus Derechos</h2>
            <p>
              Bajo el Reglamento General de Protección de Datos (GDPR) y la normativa española, 
              tienes los siguientes derechos:
            </p>
            <div className="rights-grid">
              <div className="right-item">
                <h4>🔍 Acceso</h4>
                <p>Solicitar una copia de todos los datos personales que tenemos sobre ti.</p>
              </div>
              <div className="right-item">
                <h4>✏️ Rectificación</h4>
                <p>Corregir cualquier información personal incorrecta o incompleta.</p>
              </div>
              <div className="right-item">
                <h4>🗑️ Eliminación</h4>
                <p>Solicitar la eliminación de tus datos personales ("derecho al olvido").</p>
              </div>
              <div className="right-item">
                <h4>📋 Portabilidad</h4>
                <p>Recibir tus datos en un formato estructurado y legible por máquina.</p>
              </div>
              <div className="right-item">
                <h4>🚫 Oposición</h4>
                <p>Oponerte al procesamiento de tus datos en ciertas circunstancias.</p>
              </div>
              <div className="right-item">
                <h4>⏸️ Restricción</h4>
                <p>Solicitar la limitación del procesamiento de tus datos personales.</p>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>5. Seguridad de Datos</h2>
            <p>
              Implementamos múltiples capas de seguridad para proteger tu información:
            </p>
            <div className="security-measures">
              <div className="measure-item">
                <h4>🔐 Cifrado SSL/TLS</h4>
                <p>Todas las comunicaciones están cifradas usando protocolos de seguridad estándar.</p>
              </div>
              <div className="measure-item">
                <h4>🛡️ Contraseñas Hasheadas</h4>
                <p>Las contraseñas se almacenan con hash seguro y nunca en texto plano.</p>
              </div>
              <div className="measure-item">
                <h4>🔒 Acceso Restringido</h4>
                <p>Solo el personal autorizado tiene acceso a los datos, con registro de auditoría.</p>
              </div>
              <div className="measure-item">
                <h4>🗄️ Backups Seguros</h4>
                <p>Copias de seguridad regulares y cifradas en servidores seguros.</p>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>6. Cookies y Tecnologías Similares</h2>
            <p>
              Utilizamos cookies para mejorar tu experiencia en nuestro sitio web:
            </p>
            <div className="cookies-types">
              <div className="cookie-type">
                <h4>🍪 Cookies Esenciales</h4>
                <p>Necesarias para el funcionamiento básico del sitio (sesión de usuario, seguridad).</p>
              </div>
              <div className="cookie-type">
                <h4>📊 Cookies Analíticas</h4>
                <p>Nos ayudan a entender cómo interactúas con el sitio para mejorarlo.</p>
              </div>
              <div className="cookie-type">
                <h4>⚙️ Cookies de Preferencias</h4>
                <p>Guardan tus configuraciones personalizadas (tema, idioma, filtros).</p>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>7. Retención de Datos</h2>
            <p>
              Conservamos tus datos personales solo durante el tiempo necesario para los fines 
              para los que fueron recopilados:
            </p>
            <ul>
              <li><strong>Cuenta activa:</strong> Mientras mantengas tu cuenta abierta</li>
              <li><strong>Cuenta inactiva:</strong> 2 años después de la última actividad</li>
              <li><strong>Datos de contacto:</strong> 1 año después de la última comunicación</li>
              <li><strong>Logs de seguridad:</strong> 6 meses para fines de auditoría</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>8. Contacto</h2>
            <p>
              Si tienes alguna pregunta sobre esta política de privacidad o quieres ejercer 
              alguno de tus derechos, puedes contactarnos:
            </p>
            <div className="contact-privacy">
              <p><strong>Email:</strong> privacidad@comparativavehiculos.com</p>
              <p><strong>Respuesta:</strong> Dentro de 30 días según normativa GDPR</p>
              <p><strong>Responsable:</strong> Comparativa Vehículos - Protección de Datos</p>
            </div>
          </section>

          <div className="privacy-footer">
            <p>
              <strong>Nota:</strong> Esta política puede actualizarse ocasionalmente. 
              Te notificaremos sobre cambios significativos a través de nuestro sitio web 
              o por email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 