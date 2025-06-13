// Ruta: ~/comparativa_proyecto/comparativa-backend/utils/hashUtils.js

const argon2 = require('argon2');
const crypto = require('crypto');

/**
 * Configuración de Argon2 optimizada para seguridad.
 * - type: Variante del algoritmo (argon2id: más resistente a ataques de GPU y side-channel)
 * - memoryCost: Costo de memoria en KiB (valor recomendado: 15360 = 15MB)
 * - timeCost: Iteraciones (valor recomendado: mínimo 2)
 * - parallelism: Hilos paralelos (recomendado: 1 para servidores compartidos)
 * - hashLength: Longitud del hash en bytes (recomendado: mínimo 32)
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 15360, // 15MB
  timeCost: 3,
  parallelism: 1,
  hashLength: 32
};

/**
 * Hashea una contraseña utilizando Argon2id.
 * @param {string} password - Contraseña en texto plano o pre-hasheada del cliente
 * @returns {Promise<string>} - Hash seguro para almacenar en la BD
 */
const hashPassword = async (password, isPreHashed = false) => {
  try {
    const preHashed = isPreHashed ? password : preHashPassword(password);
    return await argon2.hash(preHashed, ARGON2_OPTIONS);
  } catch (error) {
    console.error('Error al hashear la contraseña:', error);
    throw new Error('Error de seguridad al procesar la contraseña.');
  }
};

/**
 * Verifica si una contraseña coincide con un hash almacenado.
 * @param {string} hash - Hash almacenado en la BD
 * @param {string} password - Contraseña en texto plano o pre-hasheada del cliente
 * @returns {Promise<boolean>} - true si la contraseña coincide con el hash
 */
const verifyPassword = async (hash, password, isPreHashed = false) => {
  try {
    const preHashed = isPreHashed ? password : preHashPassword(password);
    return await argon2.verify(hash, preHashed);
  } catch (error) {
    console.error('Error al verificar la contraseña:', error);
    return false;
  }
};

// Pre-hash SHA-256
function preHashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = {
  hashPassword,
  verifyPassword,
  preHashPassword
};