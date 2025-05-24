// Ruta: ~/comparativa_proyecto/comparativa-backend/middleware/authMiddleware.js

/**
 * Middleware para verificar si el usuario está autenticado.
 * Comprueba si existe información de usuario en la sesión.
 * @param {object} req - Objeto de petición de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware/ruta.
 */
function isAuthenticated(req, res, next) {
  // express-session añade req.session.userId si el login fue exitoso y se guardó
  if (req.session && req.session.userId) {
    // El usuario está autenticado, permite continuar
    return next();
  } else {
    // El usuario no está autenticado, devuelve error 401 (No Autorizado)
    return res.status(401).json({ message: 'Acceso no autorizado. Por favor, inicia sesión.' });
  }
}

/**
 * Middleware para verificar si el usuario autenticado tiene el rol de 'admin'.
 * Debe usarse DESPUÉS de isAuthenticated.
 * @param {object} req - Objeto de petición de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware/ruta.
 */
function isAdmin(req, res, next) {
  // Asume que al hacer login guardamos el rol en req.session.userRole
  if (req.session && req.session.userRole === 'admin') {
    // El usuario es admin, permite continuar
    return next();
  } else {
    // El usuario está autenticado pero no es admin, devuelve error 403 (Prohibido)
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
}

module.exports = { isAuthenticated, isAdmin };