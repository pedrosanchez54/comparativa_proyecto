// Ruta: ~/comparativa_proyecto/comparativa-backend/middleware/authMiddleware.js

const { verifyToken } = require('../utils/jwtUtils');

/**
 * Middleware para verificar si el usuario está autenticado.
 * Soporta tanto JWT (desde header Authorization) como sesiones.
 * @param {object} req - Objeto de petición de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware/ruta.
 */
function isAuthenticated(req, res, next) {
  // Intentar autenticación por JWT primero
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Quitar "Bearer "
    const payload = verifyToken(token);
    
    if (payload) {
      // Token válido - agregar datos del usuario al request
      req.user = {
        id: payload.id,
        email: payload.email,
        nombre: payload.nombre,
        rol: payload.rol
      };
      return next();
    }
    // Si el token no es válido y se proporcionó, rechazar la solicitud
    // No continuamos con la verificación de sesión si el token es inválido
    return res.status(401).json({ message: 'Token de autenticación inválido.' });
  }
  
  // Si no hay token JWT, intentar autenticación por sesión
  if (req.session && req.session.userId) {
    // El usuario está autenticado por sesión, permite continuar
    req.user = {
      id: req.session.userId,
      email: req.session.userEmail,
      nombre: req.session.userName,
      rol: req.session.userRole
    };
    return next();
  }
  
  // Ningún método de autenticación válido
  return res.status(401).json({ message: 'Acceso no autorizado. Por favor, inicia sesión.' });
}

/**
 * Middleware para verificar si el usuario autenticado tiene el rol de 'admin'.
 * Debe usarse DESPUÉS de isAuthenticated.
 * @param {object} req - Objeto de petición de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware/ruta.
 */
function isAdmin(req, res, next) {
  // Usar req.user establecido por isAuthenticated
  if (req.user && req.user.rol === 'admin') {
    // El usuario es admin, permite continuar
    return next();
  } else {
    // El usuario está autenticado pero no es admin, devuelve error 403 (Prohibido)
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
}

module.exports = { isAuthenticated, isAdmin };