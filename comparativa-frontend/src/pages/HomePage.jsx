import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Para mostrar contenido condicional
// import './HomePage.css'; // Descomenta si creas estilos específicos

const HomePage = () => {
  const { isLoggedIn, user } = useAuth(); // Obtiene el estado de autenticación

  return (
    // Usamos la clase 'container' global para centrar y limitar ancho
    <div className="container home-page" style={{ textAlign: 'center', paddingTop: '40px' }}>

      {/* Encabezado de bienvenida */}
      <header className="home-header card" style={{ padding: '30px', marginBottom: '30px' }}>
        <h1>Bienvenido a ComparativaApp</h1>
        <p style={{ fontSize: '1.1rem', color: '#555' }}>
          Tu plataforma definitiva para explorar, comparar y guardar especificaciones de vehículos.
        </p>
      </header>

      {/* Contenido principal y llamadas a la acción */}
      <section className="home-content">
        <p style={{ marginBottom: '25px', fontSize: '1.05rem' }}>
          Navega por nuestro extenso catálogo, descubre detalles técnicos, compara modelos lado a lado,
          guarda tus coches favoritos y organiza tus propias listas de comparación.
        </p>

        {/* Botones principales */}
        <div className="home-actions" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
          <Link to="/vehicles" className="btn btn-primary" style={{ padding: '12px 25px', fontSize: '1.1rem' }}>
            Explorar Catálogo
          </Link>
          <Link to="/compare" className="btn btn-warning" style={{ padding: '12px 25px', fontSize: '1.1rem' }}>
            Ir a Comparativas
          </Link>
          {/* Mostrar botón de registro solo si el usuario no está logueado */}
          {!isLoggedIn && (
            <Link to="/register" className="btn btn-success" style={{ padding: '12px 25px', fontSize: '1.1rem' }}>
              Regístrate Gratis o Inicia Sesión
            </Link>
          )}
        </div>

        {/* Mensaje de bienvenida personalizado si el usuario está logueado */}
        {isLoggedIn && (
          <div className="user-welcome card" style={{ padding: '20px', backgroundColor: '#e9f7ef' }}>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>
              ¡Hola de nuevo, {user?.nombre}! ¿Listo para comparar?
            </p>
            {/* Podrías añadir enlaces rápidos aquí */}
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                 <Link to="/favorites" className="btn btn-secondary btn-sm">Mis Favoritos</Link>
                 <Link to="/my-lists" className="btn btn-secondary btn-sm">Mis Listas</Link>
            </div>
          </div>
        )}
      </section>

       {/* Sección opcional para destacar algo */}
       {/*
       <section className="featured-section card mt-3" style={{marginTop: '30px', padding: '20px'}}>
            <h2>Vehículos Destacados</h2>
            <p>Aquí podrías mostrar algunos coches populares o añadidos recientemente...</p>
       </section>
       */}
    </div>
  );
};

export default HomePage; 