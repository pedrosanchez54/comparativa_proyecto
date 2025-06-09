// Ruta: ~/comparativa_proyecto/comparativa-backend/utils/tokenUtils.js

const crypto = require('crypto'); // Módulo criptográfico incorporado en Node.js

/**
 * Genera un token criptográficamente seguro.
 * Útil para tokens de verificación, restablecimiento de contraseña, etc.
 * @param {number} length - La longitud en bytes del token a generar (por defecto 32 bytes, que resultan en 64 caracteres hexadecimales).
 * @returns {string} Un token seguro en formato hexadecimal.
 */
function generateSecureToken(length = 32) {
  // crypto.randomBytes genera bytes aleatorios seguros
  // toString('hex') convierte esos bytes a una cadena hexadecimal
  return crypto.randomBytes(length).toString('hex');
}

module.exports = { generateSecureToken };
