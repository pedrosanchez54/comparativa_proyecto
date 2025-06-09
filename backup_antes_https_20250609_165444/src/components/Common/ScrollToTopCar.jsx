import React, { useState, useEffect } from 'react';
import './ScrollToTopCar.css';

const ScrollToTopCar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    setIsAnimating(true);
    
    // Scroll suave hacia arriba
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Reset animation después de un tiempo
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  if (!isVisible && !isAnimating) return null;

  return (
    <div 
      className={`scroll-to-top-car ${isVisible ? 'car-enter' : ''} ${isAnimating ? 'car-exit' : ''}`}
      onClick={scrollToTop}
    >
      {/* Estela que aparece al subir */}
      <div className="car-trail"></div>
      
      {/* Coche visto desde arriba */}
      <div className="car-body">
        <svg 
          width="40" 
          height="60" 
          viewBox="0 0 40 60" 
          className="car-svg"
        >
          {/* Cuerpo principal del coche */}
          <rect x="8" y="15" width="24" height="35" rx="3" fill="#2c3e50" />
          
          {/* Capó */}
          <rect x="10" y="8" width="20" height="12" rx="2" fill="#34495e" />
          
          {/* Parabrisas delantero */}
          <rect x="12" y="10" width="16" height="8" rx="1" fill="#87ceeb" opacity="0.8" />
          
          {/* Parabrisas trasero */}
          <rect x="12" y="42" width="16" height="6" rx="1" fill="#87ceeb" opacity="0.8" />
          
          {/* Ruedas delanteras */}
          <circle cx="12" cy="12" r="3" fill="#1a1a1a" />
          <circle cx="28" cy="12" r="3" fill="#1a1a1a" />
          
          {/* Ruedas traseras (se agitan en hover) */}
          <circle cx="12" cy="48" r="3" fill="#1a1a1a" className="rear-wheel-left" />
          <circle cx="28" cy="48" r="3" fill="#1a1a1a" className="rear-wheel-right" />
          
          {/* Detalles decorativos */}
          <rect x="14" y="20" width="12" height="20" rx="1" fill="#3498db" opacity="0.3" />
          
          {/* Luces delanteras */}
          <circle cx="15" cy="6" r="1.5" fill="#f1c40f" />
          <circle cx="25" cy="6" r="1.5" fill="#f1c40f" />
          
          {/* Luces traseras */}
          <circle cx="15" cy="54" r="1.5" fill="#e74c3c" />
          <circle cx="25" cy="54" r="1.5" fill="#e74c3c" />
        </svg>
        
        {/* Partículas de humo/velocidad */}
        <div className="speed-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>
    </div>
  );
};

export default ScrollToTopCar; 