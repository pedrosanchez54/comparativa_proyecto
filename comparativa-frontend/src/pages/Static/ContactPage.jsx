import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './StaticPages.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulamos el envío del formulario
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Mensaje enviado correctamente. Te responderemos pronto.');
      setFormData({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
      });
    } catch (error) {
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="static-page">
      <div className="static-container">
        <div className="static-header">
          <h1>Contacto</h1>
          <p className="static-subtitle">
            ¿Tienes alguna pregunta o sugerencia? ¡Nos encantaría escucharte!
          </p>
        </div>

        <div className="static-content">
          <div className="contact-layout">
            <div className="contact-info">
              <h2>Información de Contacto</h2>
              <p>
                Estamos aquí para ayudarte. Si tienes alguna consulta sobre nuestros 
                vehículos, funcionalidades de la plataforma, o simplemente quieres 
                decirnos hola, no dudes en contactarnos.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <FaEnvelope className="contact-icon" />
                  <div>
                    <h4>Email</h4>
                    <p>info@comparativavehiculos.com</p>
                    <p>soporte@comparativavehiculos.com</p>
                  </div>
                </div>

                <div className="contact-method">
                  <FaPhone className="contact-icon" />
                  <div>
                    <h4>Teléfono</h4>
                    <p>+34 900 123 456</p>
                    <p>Lunes a Viernes: 9:00 - 18:00</p>
                  </div>
                </div>

                <div className="contact-method">
                  <FaMapMarkerAlt className="contact-icon" />
                  <div>
                    <h4>Ubicación</h4>
                    <p>Madrid, España</p>
                    <p>Trabajamos de forma remota</p>
                  </div>
                </div>
              </div>

              <div className="response-time">
                <h3>Tiempo de Respuesta</h3>
                <p>
                  📧 <strong>Email:</strong> Respondemos en menos de 24 horas
                </p>
                <p>
                  🚨 <strong>Urgencias:</strong> Respuesta prioritaria en menos de 4 horas
                </p>
              </div>
            </div>

            <div className="contact-form-section">
              <h2>Envíanos un Mensaje</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre *</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="asunto">Asunto *</label>
                  <select
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="consulta-general">Consulta General</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="problema-tecnico">Problema Técnico</option>
                    <option value="datos-vehiculo">Datos de Vehículo</option>
                    <option value="colaboracion">Colaboración</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="mensaje">Mensaje *</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Cuéntanos en detalle tu consulta o sugerencia..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <FaPaperPlane /> Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="faq-section">
            <h2>Preguntas Frecuentes</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>¿Cómo puedo sugerir un nuevo vehículo?</h4>
                <p>
                  Puedes contactarnos con los datos del vehículo que te gustaría ver 
                  en nuestra plataforma. Evaluamos todas las sugerencias.
                </p>
              </div>
              <div className="faq-item">
                <h4>¿Los datos son siempre actuales?</h4>
                <p>
                  Actualizamos constantemente nuestra base de datos. Si encuentras 
                  algún error, háznoslo saber para corregirlo rápidamente.
                </p>
              </div>
              <div className="faq-item">
                <h4>¿Puedo colaborar con el proyecto?</h4>
                <p>
                  ¡Por supuesto! Siempre buscamos colaboradores apasionados por 
                  el mundo del motor. Contacta con nosotros.
                </p>
              </div>
              <div className="faq-item">
                <h4>¿Hay algún costo por usar la plataforma?</h4>
                <p>
                  Nuestra plataforma es completamente gratuita para todos los usuarios. 
                  Creemos en el acceso libre a la información de calidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 