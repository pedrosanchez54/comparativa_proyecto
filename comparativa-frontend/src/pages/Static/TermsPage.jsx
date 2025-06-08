import React from 'react';
import { FaBalanceScale, FaHandshake, FaExclamationTriangle, FaGavel } from 'react-icons/fa';
import './StaticPages.css';

const TermsPage = () => {
  return (
    <div className="static-page">
      <div className="static-container">
        <div className="static-header">
          <h1>Términos y Condiciones</h1>
          <p className="static-subtitle">
            Condiciones de uso de la plataforma Comparativa Vehículos
          </p>
          <div className="last-updated">
            <span>Última actualización: Enero 2025</span>
          </div>
        </div>

        <div className="static-content">
          <div className="terms-intro">
            <div className="legal-badges">
              <div className="legal-badge">
                <FaBalanceScale className="legal-icon" />
                <span>Términos Justos</span>
              </div>
              <div className="legal-badge">
                <FaHandshake className="legal-icon" />
                <span>Transparentes</span>
              </div>
              <div className="legal-badge">
                <FaGavel className="legal-icon" />
                <span>Legalmente Válidos</span>
              </div>
            </div>
            <p className="terms-summary">
              Al acceder y usar Comparativa Vehículos, aceptas estos términos y condiciones. 
              Te recomendamos leerlos cuidadosamente.
            </p>
          </div>

          <section className="terms-section">
            <h2>1. Aceptación de los Términos</h2>
            <p>
              Al acceder, navegar o utilizar nuestro sitio web y servicios, confirmas que:
            </p>
            <ul>
              <li>Has leído y entendido estos términos y condiciones</li>
              <li>Aceptas estar legalmente vinculado por estos términos</li>
              <li>Eres mayor de 18 años o tienes la autorización de tus padres/tutores</li>
              <li>Cumplirás con todas las leyes aplicables mientras uses nuestros servicios</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>2. Descripción del Servicio</h2>
            <p>
              Comparativa Vehículos es una plataforma digital que proporciona:
            </p>
            <div className="service-grid">
              <div className="service-item">
                <h4>📊 Información de Vehículos</h4>
                <p>Especificaciones técnicas, tiempos de circuito y datos de rendimiento</p>
              </div>
              <div className="service-item">
                <h4>⚖️ Herramientas de Comparación</h4>
                <p>Funcionalidades para comparar múltiples vehículos lado a lado</p>
              </div>
              <div className="service-item">
                <h4>👤 Servicios de Usuario</h4>
                <p>Creación de listas personalizadas, favoritos y perfiles de usuario</p>
              </div>
              <div className="service-item">
                <h4>📚 Base de Datos</h4>
                <p>Acceso a información actualizada y verificada de vehículos</p>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2>3. Uso Aceptable</h2>
            <div className="usage-policy">
              <div className="policy-section allowed">
                <h4>✅ Uso Permitido</h4>
                <ul>
                  <li>Consultar información de vehículos para uso personal</li>
                  <li>Crear comparativas para tomar decisiones informadas</li>
                  <li>Compartir contenido público de manera responsable</li>
                  <li>Proporcionar retroalimentación constructiva</li>
                  <li>Reportar errores o problemas técnicos</li>
                </ul>
              </div>
              <div className="policy-section prohibited">
                <h4>❌ Uso Prohibido</h4>
                <ul>
                  <li>Utilizar la plataforma para actividades ilegales</li>
                  <li>Intentar acceder a sistemas o datos no autorizados</li>
                  <li>Distribuir malware, virus o código malicioso</li>
                  <li>Realizar ingeniería inversa de nuestros sistemas</li>
                  <li>Crear múltiples cuentas para evitar restricciones</li>
                  <li>Comercializar nuestros datos sin autorización</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2>4. Cuentas de Usuario</h2>
            <h3>4.1 Creación de Cuenta</h3>
            <p>
              Para acceder a funcionalidades avanzadas, puedes crear una cuenta proporcionando 
              información veraz y actualizada. Eres responsable de:
            </p>
            <ul>
              <li>Mantener la confidencialidad de tu contraseña</li>
              <li>Notificarnos inmediatamente sobre uso no autorizado</li>
              <li>Asegurar que la información de tu perfil sea precisa</li>
              <li>Cumplir con estos términos en toda actividad de tu cuenta</li>
            </ul>

            <h3>4.2 Suspensión de Cuenta</h3>
            <p>
              Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos, 
              con o sin previo aviso, especialmente en casos de:
            </p>
            <ul>
              <li>Violación repetida de nuestras políticas</li>
              <li>Actividad fraudulenta o maliciosa</li>
              <li>Incumplimiento de la ley aplicable</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>5. Propiedad Intelectual</h2>
            <h3>5.1 Nuestro Contenido</h3>
            <p>
              Todo el contenido de Comparativa Vehículos, incluyendo pero no limitado a:
            </p>
            <ul>
              <li>Diseño, código fuente y arquitectura de la aplicación</li>
              <li>Logotipos, marcas comerciales y elementos gráficos</li>
              <li>Compilación y organización de datos de vehículos</li>
              <li>Algoritmos de comparación y análisis</li>
            </ul>
            <p>
              Está protegido por derechos de autor y otras leyes de propiedad intelectual.
            </p>

            <h3>5.2 Tu Contenido</h3>
            <p>
              El contenido que generes (listas, comentarios, valoraciones) permanece siendo tuyo, 
              pero nos otorgas una licencia no exclusiva para utilizarlo en la plataforma.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Exención de Responsabilidad</h2>
            <div className="disclaimer-box">
              <FaExclamationTriangle className="warning-icon" />
              <div className="disclaimer-content">
                <h4>Información de Vehículos</h4>
                <p>
                  La información proporcionada es para fines informativos únicamente. 
                  Aunque nos esforzamos por mantener datos precisos y actualizados:
                </p>
                <ul>
                  <li>No garantizamos la exactitud del 100% de los datos</li>
                  <li>Los fabricantes pueden cambiar especificaciones sin previo aviso</li>
                  <li>Los tiempos de circuito pueden variar según condiciones</li>
                  <li>Recomendamos verificar información crítica con fuentes oficiales</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2>7. Limitación de Responsabilidad</h2>
            <p>
              En la máxima medida permitida por la ley aplicable, Comparativa Vehículos 
              no será responsable por:
            </p>
            <ul>
              <li>Daños indirectos, incidentales o consecuenciales</li>
              <li>Pérdida de beneficios, datos o oportunidades comerciales</li>
              <li>Interrupciones del servicio por mantenimiento o causas técnicas</li>
              <li>Decisiones tomadas basándose únicamente en nuestra información</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>8. Modificaciones del Servicio</h2>
            <p>
              Nos reservamos el derecho de:
            </p>
            <ul>
              <li>Modificar, suspender o discontinuar cualquier parte del servicio</li>
              <li>Actualizar estos términos y condiciones cuando sea necesario</li>
              <li>Cambiar precios (si aplicara) con 30 días de antelación</li>
              <li>Implementar nuevas funcionalidades o restricciones</li>
            </ul>
            <p>
              <strong>Notificaciones:</strong> Te informaremos sobre cambios significativos 
              a través de nuestro sitio web o por email.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Ley Aplicable y Jurisdicción</h2>
            <p>
              Estos términos se rigen por las leyes de España. Cualquier disputa será resuelta 
              en los tribunales competentes de Madrid, España.
            </p>
            <div className="jurisdiction-info">
              <h4>📍 Información Legal</h4>
              <ul>
                <li><strong>Ley aplicable:</strong> Legislación española</li>
                <li><strong>Jurisdicción:</strong> Tribunales de Madrid</li>
                <li><strong>Idioma legal:</strong> Español</li>
                <li><strong>Normativas:</strong> GDPR, LOPD, normativa de consumo</li>
              </ul>
            </div>
          </section>

          <section className="terms-section">
            <h2>10. Contacto Legal</h2>
            <p>
              Para consultas relacionadas con estos términos y condiciones:
            </p>
            <div className="legal-contact">
              <p><strong>Email Legal:</strong> legal@comparativavehiculos.com</p>
              <p><strong>Departamento:</strong> Asuntos Legales y Cumplimiento</p>
              <p><strong>Tiempo de respuesta:</strong> 15 días hábiles</p>
            </div>
          </section>

          <div className="terms-footer">
            <div className="effective-date">
              <h4>Vigencia</h4>
              <p>
                Estos términos entran en vigor desde tu primer uso de la plataforma 
                y permanecen vigentes mientras utilices nuestros servicios.
              </p>
            </div>
            <div className="severability">
              <h4>Separabilidad</h4>
              <p>
                Si alguna disposición de estos términos se considera inválida, 
                el resto permanecerá en pleno vigor y efecto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 