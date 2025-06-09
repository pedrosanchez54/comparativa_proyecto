import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './BackButton.css';

const BackButton = ({ 
  onClick, 
  text = 'Volver', 
  className = '', 
  style = {},
  goBack = -1,
  variant = '', // 'compact', 'large', o '' para normal
  disabled = false
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (disabled) return;
    
    if (onClick) {
      onClick();
    } else if (typeof goBack === 'string') {
      // Si goBack es una string, navegar a esa ruta
      navigate(goBack);
    } else {
      // Si es un número, usar navigate con ese número
      navigate(goBack);
    }
  };

  const buttonClass = `back-button ${variant} ${className}`.trim();

  return (
    <button 
      onClick={handleClick} 
      className={buttonClass}
      style={style}
      disabled={disabled}
      type="button"
    >
      <FaArrowLeft /> {text}
    </button>
  );
};

export default BackButton; 