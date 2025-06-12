// Ruta: ~/comparativa_proyecto/comparativa-backend/utils/hashUtils.js

const argon2 = require('argon2');

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
 * @param {boolean} isPreHashed - Indica si la contraseña ya viene pre-hasheada desde el cliente
 * @returns {Promise<string>} - Hash seguro para almacenar en la BD
 */
const hashPassword = async (password, isPreHashed = false) => {
  try {
    // Si la contraseña ya viene pre-hasheada desde el cliente, la manejamos diferente
    // Esta es una capa adicional de seguridad para evitar transmitir contraseñas en texto plano
    // La aplicación cliente debe aplicar el mismo enfoque para login y cambios de contraseña
    if (isPreHashed) {
      // El cliente ya aplicó un pre-hash, por lo que adaptamos el proceso
      // Aún así aplicamos un hash completo con salt en el servidor
      return await argon2.hash(password, {
        ...ARGON2_OPTIONS,
        // Usamos un salt específico para contraseñas pre-hasheadas
        salt: Buffer.from(`prehashed_${password.substring(0, 8)}`, 'utf8')
      });
    }
    
    // Proceso normal para contraseñas en texto plano - argon2 genera un salt aleatorio
    return await argon2.hash(password, ARGON2_OPTIONS);
  } catch (error) {
    console.error('Error al hashear la contraseña:', error);
    throw new Error('Error de seguridad al procesar la contraseña.');
  }
};

/**
 * Verifica si una contraseña coincide con un hash almacenado.
 * @param {string} hash - Hash almacenado en la BD
 * @param {string} password - Contraseña en texto plano o pre-hasheada del cliente
 * @param {boolean} isPreHashed - Indica si la contraseña ya viene pre-hasheada desde el cliente
 * @returns {Promise<boolean>} - true si la contraseña coincide con el hash
 */
const verifyPassword = async (hash, password, isPreHashed = false) => {
  try {
    // Si la contraseña es pre-hasheada, necesitamos verificarla de manera diferente
    // Este enfoque mantiene la compatibilidad con hashes existentes
    if (isPreHashed) {
      // Para la verificación, argon2 usa el salt almacenado en el hash
      // por lo que funciona correctamente independientemente del método de hash usado
      return await argon2.verify(hash, password);
    }
    
    // Verificación normal para contraseñas en texto plano
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('Error al verificar la contraseña:', error);
    return false; // Retornar false en caso de error (no lanzar excepción)
  }
};

module.exports = {
  hashPassword,
  verifyPassword
};