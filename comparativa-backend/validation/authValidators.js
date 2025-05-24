// Ruta: ~/comparativa_proyecto/comparativa-backend/validation/authValidators.js

const { body } = require('express-validator');

// Reglas de validación para el registro de usuarios
const registerValidation = [
  body('nombre')
    .trim() // Elimina espacios al inicio y final
    .notEmpty().withMessage('El nombre es requerido.') // No puede estar vacío
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'), // Longitud válida

  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido.')
    .isEmail().withMessage('Debe ser un formato de email válido.') // Verifica formato email
    .normalizeEmail(), // Convierte a minúsculas y maneja subdirecciones (ej. '+' en Gmail)

  body('contraseña')
    .notEmpty().withMessage('La contraseña es requerida.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    // Opcional: Añadir más reglas de fortaleza (ej. requerir mayúsculas, números, símbolos)
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    // .withMessage('La contraseña debe contener mayúscula, minúscula, número y símbolo.')
];

// Reglas de validación para el inicio de sesión
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido.')
    .isEmail().withMessage('Formato de email inválido.')
    .normalizeEmail(),

  body('contraseña')
    .notEmpty().withMessage('La contraseña es requerida.')
];

// Reglas de validación para solicitar restablecimiento de contraseña
const requestPasswordResetValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido.')
    .isEmail().withMessage('Formato de email inválido.')
    .normalizeEmail()
];

// Reglas de validación para restablecer la contraseña usando el token
const resetPasswordValidation = [
   body('nuevaContraseña')
    .notEmpty().withMessage('La nueva contraseña es requerida.')
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres.')
    // Asegúrate de aplicar las mismas reglas de fortaleza que en el registro si las añadiste
];


module.exports = {
  registerValidation,
  loginValidation,
  requestPasswordResetValidation,
  resetPasswordValidation
};