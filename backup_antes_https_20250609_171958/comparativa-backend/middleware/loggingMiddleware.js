// Ruta: ~/comparativa_proyecto/comparativa-backend/middleware/loggingMiddleware.js

const morgan = require('morgan');

// Configura morgan para loguear las peticiones HTTP en la consola.
// 'dev': Formato conciso y coloreado, bueno para desarrollo.
//          Ej: GET /api/vehicles 200 5.123 ms - 1024
// Otros formatos útiles:
// 'combined': Formato estándar de Apache (más detallado).
// 'short':    Menos detallado que 'dev'.
// 'tiny':     El más mínimo.
// Puedes definir formatos personalizados si lo necesitas.
const httpLogger = morgan('dev');

module.exports = httpLogger;
