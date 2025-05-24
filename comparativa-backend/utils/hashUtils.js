// Ruta: ~/comparativa_proyecto/comparativa-backend/utils/hashUtils.js

const argon2 = require('argon2');

/**
 * Genera un hash seguro de una contraseña usando Argon2id.
 * @param {string} password - La contraseña en texto plano.
 * @returns {Promise<string>} El hash de la contraseña.
 * @throws {Error} Si ocurre un error durante el hashing.
 */
async function hashPassword(password) {
  try {
    // Usar opciones por defecto de argon2 suele ser seguro y recomendado
    return await argon2.hash(password);
  } catch (err) {
    console.error("Error al hashear la contraseña:", err);
    // En producción, podrías querer loguear esto de forma más estructurada
    throw new Error('Error interno al proteger la contraseña.');
  }
}

/**
 * Verifica si una contraseña en texto plano coincide con un hash almacenado.
 * @param {string} hashedPassword - El hash almacenado en la base de datos.
 * @param {string} plainPassword - La contraseña en texto plano introducida por el usuario.
 * @returns {Promise<boolean>} True si la contraseña coincide, false en caso contrario o si hay error.
 */
async function verifyPassword(hashedPassword, plainPassword) {
  try {
    // Compara la contraseña plana con el hash almacenado
    return await argon2.verify(hashedPassword, plainPassword);
  } catch (err) {
    // El error puede ser por contraseña incorrecta, hash inválido, parámetros incorrectos, etc.
    // No loguear la contraseña plana aquí por seguridad.
    console.error("Error al verificar la contraseña:", err.message); // Loguear solo el mensaje de error
    return false; // Devolver false en caso de error o no coincidencia es más seguro
  }
}

module.exports = { hashPassword, verifyPassword };