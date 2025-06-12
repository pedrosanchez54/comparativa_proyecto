// Ruta: ~/comparativa_proyecto/comparativa-backend/server-https.js

// Cargar variables de entorno desde .env al inicio de todo
require('dotenv').config();

// Importar módulos necesarios
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Importar configuración y middlewares propios
const { testDbConnection } = require('./config/db');
const httpLogger = require('./middleware/loggingMiddleware');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

// Importar todos los archivos de rutas
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const listRoutes = require('./routes/listRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const userRoutes = require('./routes/userRoutes');
const timeRoutes = require('./routes/timeRoutes');
const imageRoutes = require('./routes/imageRoutes');

// Crear la instancia de la aplicación Express
const app = express();

// Probar la conexión a la base de datos al iniciar el servidor
testDbConnection();

// --- Configuración SSL ---
const SSL_DIR = process.env.SSL_DIR || '/opt/comparativa/ssl';
const sslOptions = {
  key: fs.readFileSync(path.join(SSL_DIR, 'privkey.pem')),
  cert: fs.readFileSync(path.join(SSL_DIR, 'fullchain.pem'))
};

// --- Middlewares Esenciales ---

// 1. CORS
app.use(cors({
  origin: [
    'https://localhost:3000',
    'https://192.168.1.82:3000',
    'https://proyectocomparativa.ddns.net:3000',
    'https://proyectocomparativa.ddns.net'
  ],
  credentials: true
}));

// 2. Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https://proyectocomparativa.ddns.net:4000"],
    },
  },
}));

// 3. Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Logger
app.use(httpLogger);

// 4.5. Servir archivos estáticos
app.use('/api/images/vehicles', express.static(path.join(__dirname, '../comparativa-frontend/public/img/vehicles')));

// 5. Sesiones (configuradas para HTTPS)
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'comparativa'
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'tu_secreto_seguro',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// --- Montaje de Rutas ---
const apiPrefix = '/api';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/vehicles`, vehicleRoutes);
app.use(`${apiPrefix}/lists`, listRoutes);
app.use(`${apiPrefix}/favorites`, favoriteRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/times`, timeRoutes);
app.use(`${apiPrefix}/images`, imageRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ 
        message: `Bienvenido al Backend HTTPS de Comparativa App - ${new Date().toLocaleTimeString()}`,
        protocol: 'HTTPS',
        secure: true
    });
});

// Middlewares de error
app.use(notFoundHandler);
app.use(errorHandler);

// --- Iniciar Servidores ---
const PORT = parseInt(process.env.PORT) || 4000;

// Servidor HTTPS (principal)
const httpsServer = https.createServer(sslOptions, app);
httpsServer.listen(PORT, '0.0.0.0', () => {
  console.log(`-------------------------------------------------------`);
  console.log(`🔒 Servidor Backend HTTPS escuchando en https://0.0.0.0:${PORT}`);
  console.log(`      Entorno: ${process.env.NODE_ENV}`);
  console.log(`      Frontend esperado en: ${process.env.FRONTEND_URL}`);
  console.log(`      SSL: Habilitado`);
  console.log(`-------------------------------------------------------`);
});

// Servidor HTTP (solo para redirección)
const httpApp = express();
httpApp.use((req, res) => {
  const httpsPort = PORT === 4000 ? '' : `:${PORT}`;
  const httpsUrl = `https://${req.headers.host.split(':')[0]}${httpsPort}${req.url}`;
  res.redirect(301, httpsUrl);
});

const httpServer = http.createServer(httpApp);
const HTTP_PORT = PORT === 4000 ? 8080 : PORT + 1000;
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`🔄 Servidor HTTP (redirección) escuchando en http://0.0.0.0:${HTTP_PORT}`);
});

// Manejo de señales para cierre grácil
const gracefulShutdown = (signal) => {
    console.log(`\nRecibida señal ${signal}. Cerrando servidores...`);
    httpsServer.close(() => {
        httpServer.close(() => {
            console.log('Servidores cerrados correctamente');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
