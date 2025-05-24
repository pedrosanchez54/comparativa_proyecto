// Ruta: ~/comparativa_proyecto/comparativa-backend/server.js

// Cargar variables de entorno desde .env al inicio de todo
require('dotenv').config();

// Importar módulos necesarios
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
// const KnexSessionStore = require('connect-session-knex')(session); // Descomentar si usas Knex para sesiones en BD
// const knex = require('knex')(require('./knexfile')); // Descomentar y configurar si usas Knex

// Importar configuración y middlewares propios
const { testDbConnection } = require('./config/db'); // Para probar conexión al inicio
const httpLogger = require('./middleware/loggingMiddleware'); // Morgan para logs HTTP
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware'); // Manejadores de errores

// Importar todos los archivos de rutas
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const listRoutes = require('./routes/listRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const timeRoutes = require('./routes/timeRoutes');
const imageRoutes = require('./routes/imageRoutes');

// Crear la instancia de la aplicación Express
const app = express();

// Probar la conexión a la base de datos al iniciar el servidor
testDbConnection();

// --- Middlewares Esenciales (se ejecutan en orden) ---

// 1. CORS (Cross-Origin Resource Sharing)
// Permite que el frontend (ej. localhost:3000, 3001, 3002) haga peticiones al backend (ej. localhost:4000)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://192.168.1.82:3000', // Acceso local desde móvil
    'http://TU_DDNS_AQUI:3000'  // Acceso externo por DDNS (reemplaza por tu dominio DDNS real)
  ],
  credentials: true // ¡MUY IMPORTANTE! Permite enviar y recibir cookies de sesión
}));

// 2. Helmet
// Añade varias cabeceras HTTP para mejorar la seguridad (protección contra XSS, clickjacking, etc.)
app.use(helmet());

// 3. Body Parsers
// Permite a Express leer datos JSON enviados en el cuerpo de las peticiones (POST, PUT)
app.use(express.json({ limit: '10kb' })); // Limitar tamaño del payload para prevenir ataques DoS
// Permite leer datos enviados desde formularios HTML tradicionales (menos común en APIs REST)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Logger de Peticiones HTTP (Morgan)
// Muestra información sobre cada petición recibida en la consola (útil para depuración)
app.use(httpLogger);

// 5. Configuración de Sesiones (express-session)
// Crea y gestiona las sesiones de usuario usando cookies
// const store = new KnexSessionStore({ knex }); // Descomentar y configurar si quieres sesiones persistentes en BD
app.use(session({
  secret: process.env.SESSION_SECRET, // Clave secreta para firmar la cookie (¡DEBE SER SECRETA Y LARGA!)
  // store: store, // Descomentar si usas un store persistente
  resave: false, // No volver a guardar la sesión si no ha cambiado
  saveUninitialized: false, // No crear sesión hasta que el usuario inicie sesión o se guarde algo
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true: Solo enviar cookie sobre HTTPS (esencial en producción)
    httpOnly: true, // true: La cookie no es accesible desde JavaScript en el navegador (previene ataques XSS)
    maxAge: parseInt(process.env.SESSION_LIFETIME || 86400000), // Tiempo de vida de la cookie en ms (1 día por defecto)
    sameSite: 'lax' // 'lax' (recomendado) o 'strict'. Ayuda a prevenir ataques CSRF.
                     // Si frontend y backend están en dominios diferentes (ej. api.midominio.com y [www.midominio.com](https://www.midominio.com)),
                     // podrías necesitar 'none', pero OBLIGATORIAMENTE requiere secure: true (HTTPS).
  },
  name: process.env.SESSION_COOKIE_NAME || 'comparativa_app_sid' // Nombre personalizado para la cookie de sesión
}));


// --- Montaje de Rutas ---
// Define un prefijo común para todas las rutas de la API (ej. /api/...)
const apiPrefix = '/api';

// Asocia cada conjunto de rutas con su prefijo
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/vehicles`, vehicleRoutes);
app.use(`${apiPrefix}/lists`, listRoutes);
app.use(`${apiPrefix}/favorites`, favoriteRoutes);
app.use(`${apiPrefix}/times`, timeRoutes);
app.use(`${apiPrefix}/images`, imageRoutes);

// Ruta raíz de prueba (opcional)
app.get('/', (req, res) => {
    res.json({ message: `Bienvenido al Backend de Comparativa App - ${new Date().toLocaleTimeString()}` });
});


// --- Middlewares de Manejo de Errores (IMPORTANTE: van al final, después de las rutas) ---

// 1. Manejador para rutas no encontradas (404)
// Si ninguna ruta anterior coincide, se ejecuta este middleware
app.use(notFoundHandler);

// 2. Manejador de errores general
// Captura cualquier error pasado por `next(error)` desde los controladores o middlewares anteriores
app.use(errorHandler);


// --- Iniciar el Servidor ---
// Lee el puerto desde .env o usa 4000 por defecto
const PORT = process.env.PORT || 4000;

// Pone el servidor a escuchar en el puerto especificado
app.listen(PORT, '0.0.0.0', () => {
  console.log(`-------------------------------------------------------`);
  console.log(`🚀 Servidor Backend escuchando en http://0.0.0.0:${PORT}`);
  console.log(`      Entorno: ${process.env.NODE_ENV}`);
  console.log(`      Frontend esperado en: ${process.env.FRONTEND_URL}`);
  console.log(`-------------------------------------------------------`);
});

// (Opcional) Manejo de señales para cierre grácil (buena práctica)
const gracefulShutdown = (signal) => {
    console.log(`\nRecibida señal ${signal}. Cerrando servidor backend...`);
    // Aquí podrías añadir lógica para cerrar conexiones a BD, etc.
    // pool.end(); // Ejemplo para cerrar pool de MySQL
    process.exit(0); // Salir limpiamente
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Señal de terminación estándar
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Señal de interrupción (Ctrl+C)
