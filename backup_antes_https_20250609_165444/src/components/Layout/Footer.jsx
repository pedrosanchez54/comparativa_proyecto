import React from 'react';
import './Footer.css'; // Importa los estilos para el Footer

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Obtiene el año actual dinámicamente

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Texto de copyright */}
        <p>&copy; {currentYear} ComparativaApp ASIR. Todos los derechos reservados.</p>
        {/* Puedes añadir más información o enlaces aquí */}
        {/* <p>
          <a href="/about">Acerca de</a> | <a href="/contact">Contacto</a> | <a href="/privacy">Privacidad</a>
        </p> */}
      </div>
    </footer>
  );
};

export default Footer; 