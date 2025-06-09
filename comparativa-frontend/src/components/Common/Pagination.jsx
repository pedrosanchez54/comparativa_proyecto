import React, { useState, useEffect } from 'react';
import './Pagination.css'; // Importa los estilos
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'; // Iconos para flechas

/**
 * Componente de paginación reutilizable.
 * @param {object} props - Propiedades del componente.
 * @param {number} props.currentPage - La página actualmente activa.
 * @param {number} props.totalPages - El número total de páginas.
 * @param {function} props.onPageChange - Función callback que se llama cuando se selecciona una nueva página, recibe el número de página como argumento.
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Escuchar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // No mostrar paginación si solo hay una página o ninguna
  if (totalPages <= 1) {
    return null;
  }

  // --- Lógica para generar los números de página a mostrar ---
  const getPageNumbers = () => {
    const pageNumbers = [];
    // Adaptar número de páginas según el ancho de pantalla
    const maxPagesToShow = windowWidth <= 460 ? 3 : (windowWidth <= 768 ? 4 : 5);
    const halfPages = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfPages);
    let endPage = Math.min(totalPages, currentPage + halfPages);

    // Ajustar el rango si estamos cerca del inicio o del final para mantener el número máximo de botones
    if (currentPage <= halfPages) {
        // Cerca del inicio: mostrar desde 1 hasta maxPagesToShow (o totalPages si es menor)
        endPage = Math.min(totalPages, maxPagesToShow);
    }
    if (currentPage + halfPages >= totalPages) {
        // Cerca del final: mostrar las últimas maxPagesToShow páginas
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    // Añadir el botón '1' y '...' si es necesario al principio
    if (startPage > 1) {
        pageNumbers.push(1); // Siempre mostrar la primera página
        if (startPage > 2) {
            pageNumbers.push('...'); // Añadir ellipsis si hay hueco
        }
    }

    // Añadir los números de página del rango calculado
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Añadir '...' y el último botón de página si es necesario al final
     if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageNumbers.push('...'); // Añadir ellipsis si hay hueco
        }
        pageNumbers.push(totalPages); // Siempre mostrar la última página
    }

    return pageNumbers;
  };

  // --- Renderizado del componente ---
  return (
    // Contenedor de navegación semántico
    <nav className="pagination-nav" aria-label="Paginación">
      <ul className="pagination">
        {/* Botón "Anterior" */}
        <li className={`page-item prev-btn ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Página anterior" // Accesibilidad
          >
            <FaAngleLeft aria-hidden="true" />
            <span className="btn-text">Anterior</span>
          </button>
        </li>

        {/* Números de página y Ellipsis (...) */}
        {getPageNumbers().map((number, index) => (
          <li
            key={index}
            className={`page-item ${number === currentPage ? 'active' : ''} ${number === '...' ? 'disabled ellipsis' : ''}`}
          >
            {number === '...' ? (
              // Elemento no clickeable para ellipsis
              <span className="page-link" aria-hidden="true">...</span>
            ) : (
              // Botón para cada número de página
              <button
                className="page-link"
                onClick={() => onPageChange(number)}
                // Indicar página actual para accesibilidad
                aria-current={number === currentPage ? 'page' : undefined}
              >
                {number}
              </button>
            )}
          </li>
        ))}

        {/* Botón "Siguiente" */}
        <li className={`page-item next-btn ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente" // Accesibilidad
          >
            <span className="btn-text">Siguiente</span>
            <FaAngleRight aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination; 