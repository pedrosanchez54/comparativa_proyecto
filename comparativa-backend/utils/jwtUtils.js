const jwt = require('jsonwebtoken');

// Obtener la clave secreta desde las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_aqui';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 7 días por defecto

/**
 * Genera un token JWT para un usuario
 * @param {Object} user - Objeto del usuario con id, email, nombre, rol
 * @returns {string} Token JWT
 */
function generateToken(user) {
  const payload = {
    id: user.id_usuario || user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'comparativa-vehiculos-app'
  });
}

/**
 * Verifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object|null} Payload del token si es válido, null si no es válido
 */
function verifyToken(token) {
  if (!token || token.trim() === '') {
    console.warn('Se intentó verificar un token vacío o nulo');
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificación adicional de que el token tiene los campos esperados
    if (!decoded.id || !decoded.email) {
      console.warn('Token JWT válido pero falta información de usuario');
      return null;
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.warn('Token JWT expirado:', error.message);
    } else if (error.name === 'JsonWebTokenError') {
      console.warn('Error en verificación de token JWT:', error.message);
    } else {
      console.error('Error inesperado verificando token JWT:', error);
    }
    return null;
  }
}

/**
 * Decodifica un token JWT sin verificar (útil para debug)
 * @param {string} token - Token JWT a decodificar
 * @returns {Object|null} Payload del token decodificado
 */
function decodeToken(token) {
  if (!token || token.trim() === '') {
    return null;
  }
  
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Error decodificando token JWT:', error.message);
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
}; 