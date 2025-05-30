import React from 'react';

const NewCompareIcon = ({ selected, className }) => {
  const primaryColor = selected ? 'var(--cherry-red)' : '#6c757d'; // Rojo si está seleccionado, gris si no
  const secondaryColor = '#6c757d'; // Gris para los otros coches
  const accentColor = 'var(--cherry-red)'; // Rojo para el coche destacado

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 100 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Coche de fondo izquierdo (gris) */}
      <path
        d="M8,50 C4,50 2,47 2,44 L2,35 C2,30 4,29 8,29 L15,29 C15,25 18,22 22,22 C26,22 29,25 29,29 L36,29 C40,29 42,30 42,35 L42,44 C42,47 40,50 36,50 L8,50 Z M10,46 L34,46 L34,37 C34,35 33,33 30,33 L29,33 L29,31 C29,27 26,24 22,24 C18,24 15,27 15,31 L15,33 L12,33 C11,33 10,35 10,37 L10,46 Z"
        fill={secondaryColor}
        transform="translate(5, 5) scale(0.85)"
      />
      {/* Coche de fondo derecho (rojo o gris según selección) */}
      <path
        d="M8,50 C4,50 2,47 2,44 L2,35 C2,30 4,29 8,29 L15,29 C15,25 18,22 22,22 C26,22 29,25 29,29 L36,29 C40,29 42,30 42,35 L42,44 C42,47 40,50 36,50 L8,50 Z M10,46 L34,46 L34,37 C34,35 33,33 30,33 L29,33 L29,31 C29,27 26,24 22,24 C18,24 15,27 15,31 L15,33 L12,33 C11,33 10,35 10,37 L10,46 Z"
        fill={primaryColor} // Color primario (rojo si seleccionado)
        transform="translate(45, 5) scale(0.85)"
      />
      {/* Coche frontal (negro/gris oscuro) */}
      <path
        d="M12,70 C6,70 4,67 4,63 L4,52 C4,46 6,45 12,45 L21,45 C21,39 25,35 30,35 C35,35 39,39 39,45 L48,45 C54,45 56,46 56,52 L56,63 C56,67 54,70 48,70 L12,70 Z M15,65 L45,65 L45,55 C45,52 43,50 40,50 L39,50 L39,48 C39,42 35,38 30,38 C25,38 21,42 21,48 L21,50 L19,50 C17,50 15,52 15,55 L15,65 Z"
        fill="#343a40" // Un gris oscuro para el coche frontal
        transform="translate(20, 18) scale(1)"
      />
    </svg>
  );
};

export default NewCompareIcon; 