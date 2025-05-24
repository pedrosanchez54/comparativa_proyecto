// Ruta: ~/comparativa_proyecto/comparativa-backend/routes/authRoutes.js

const express = require('express');
const authController = require('../controllers/authController');
// Importar validadores específicos para cada ruta de autenticación
const {
    registerValidation,
    loginValidation,
    requestPasswordResetValidation,
    resetPasswordValidation
} = require('../validation/authValidators');
// Importar middleware para proteger rutas que requieren login
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Rutas de Autenticación ---

// POST /api/auth/register - Registro de nuevo usuario
// Valida los datos del body antes de pasar al controlador
router.post('/register', registerValidation, authController.register);

// POST /api/auth/login - Inicio de sesión
// Valida los datos del body antes de pasar al controlador
router.post('/login', loginValidation, authController.login);

// POST /api/auth/logout - Cierre de sesión
// Requiere que el usuario esté autenticado (isAuthenticated)
router.post('/logout', isAuthenticated, authController.logout);

// POST /api/auth/request-password-reset - Solicitar token de recuperación por email
// Valida el email del body
router.post('/request-password-reset', requestPasswordResetValidation, authController.requestPasswordReset);

// POST /api/auth/reset-password/:token - Restablecer contraseña usando el token de la URL
// Valida la nueva contraseña del body
router.post('/reset-password/:token', resetPasswordValidation, authController.resetPassword);

// GET /api/auth/session - Verificar si hay una sesión activa y obtener datos del usuario
// No requiere isAuthenticated aquí directamente, el controlador maneja ambos casos (logueado/no logueado)
router.get('/session', authController.checkSession);

module.exports = router;