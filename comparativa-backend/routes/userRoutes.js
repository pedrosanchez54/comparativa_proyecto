// Ruta: ~/comparativa_proyecto/comparativa-backend/routes/userRoutes.js

const express = require('express');
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas de usuarios
router.use(isAuthenticated);

// Validadores
const updateProfileValidation = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre es requerido.')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('El email es requerido.')
        .isEmail()
        .withMessage('Debe ser un formato de email válido.')
        .normalizeEmail()
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('La contraseña actual es requerida.'),
    body('newPassword')
        .notEmpty()
        .withMessage('La nueva contraseña es requerida.')
        .isLength({ min: 8 })
        .withMessage('La nueva contraseña debe tener al menos 8 caracteres.')
];

const vehicleIdValidation = [
    param('vehicleId')
        .isInt({ min: 1 })
        .withMessage('El ID del vehículo debe ser un número entero positivo.')
];

const addToFavoritesValidation = [
    body('vehicleId')
        .isInt({ min: 1 })
        .withMessage('El ID del vehículo debe ser un número entero positivo.')
];

const listIdValidation = [
    param('listId')
        .isInt({ min: 1 })
        .withMessage('El ID de la lista debe ser un número entero positivo.')
];

const createListValidation = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre de la lista es requerido.')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres.')
];

const updateListValidation = [
    param('listId')
        .isInt({ min: 1 })
        .withMessage('El ID de la lista debe ser un número entero positivo.'),
    body('nombre')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres.')
];

const vehicleToListValidation = [
    param('listId')
        .isInt({ min: 1 })
        .withMessage('El ID de la lista debe ser un número entero positivo.'),
    param('vehicleId')
        .isInt({ min: 1 })
        .withMessage('El ID del vehículo debe ser un número entero positivo.')
];

// --- Rutas de Perfil ---

// PUT /api/users/profile - Actualizar perfil del usuario
router.put('/profile', updateProfileValidation, userController.updateProfile);

// PUT /api/users/password - Cambiar contraseña del usuario
router.put('/password', changePasswordValidation, userController.changePassword);

// --- Rutas de Favoritos ---

// GET /api/users/favorites - Obtener todos los favoritos del usuario
router.get('/favorites', userController.getFavorites);

// GET /api/users/favorites/:vehicleId - Verificar si un vehículo es favorito
router.get('/favorites/:vehicleId', vehicleIdValidation, userController.checkFavoriteStatus);

// POST /api/users/favorites - Añadir vehículo a favoritos
router.post('/favorites', addToFavoritesValidation, userController.addToFavorites);

// DELETE /api/users/favorites/:vehicleId - Quitar vehículo de favoritos
router.delete('/favorites/:vehicleId', vehicleIdValidation, userController.removeFromFavorites);

// --- Rutas de Listas ---

// GET /api/users/lists - Obtener todas las listas del usuario
router.get('/lists', userController.getLists);

// POST /api/users/lists - Crear una nueva lista
router.post('/lists', createListValidation, userController.createList);

// GET /api/users/lists/:listId - Obtener detalles de una lista específica
router.get('/lists/:listId', listIdValidation, userController.getListDetails);

// PUT /api/users/lists/:listId - Actualizar una lista
router.put('/lists/:listId', updateListValidation, userController.updateList);

// DELETE /api/users/lists/:listId - Eliminar una lista
router.delete('/lists/:listId', listIdValidation, userController.deleteList);

// --- Rutas para gestionar vehículos dentro de listas ---

// GET /api/users/lists/vehicle/:vehicleId - Verificar en qué listas está un vehículo
router.get('/lists/vehicle/:vehicleId', vehicleIdValidation, userController.getVehicleListStatus);

// POST /api/users/lists/:listId/vehicles/:vehicleId - Añadir un vehículo a una lista
router.post('/lists/:listId/vehicles/:vehicleId', vehicleToListValidation, userController.addVehicleToList);

// DELETE /api/users/lists/:listId/vehicles/:vehicleId - Quitar un vehículo de una lista
router.delete('/lists/:listId/vehicles/:vehicleId', vehicleToListValidation, userController.removeVehicleFromList);

module.exports = router; 