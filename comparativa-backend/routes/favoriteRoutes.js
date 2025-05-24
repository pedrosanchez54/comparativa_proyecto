// Ruta: ~/comparativa_proyecto/comparativa-backend/routes/favoriteRoutes.js

const express = require('express');
const favoriteController = require('../controllers/favoriteController');
// Importar middleware de autenticación
const { isAuthenticated } = require('../middleware/authMiddleware');
// Importar validador para el ID del vehículo en la URL
const { vehicleIdParamValidation } = require('../validation/favoriteValidators'); // Reutiliza el validador de ID

const router = express.Router();

// Aplicar middleware isAuthenticated a TODAS las rutas de favoritos
router.use(isAuthenticated);

// --- Rutas de Favoritos (Requieren Login) ---

// GET /api/favorites - Obtener todos los vehículos favoritos del usuario
router.get('/', favoriteController.getMyFavorites);

// POST /api/favorites/:idVehiculo - Añadir un vehículo a favoritos
// Valida el idVehiculo de la URL
router.post('/:idVehiculo', vehicleIdParamValidation, favoriteController.addFavorite);

// DELETE /api/favorites/:idVehiculo - Quitar un vehículo de favoritos
// Valida el idVehiculo de la URL
router.delete('/:idVehiculo', vehicleIdParamValidation, favoriteController.removeFavorite);

// GET /api/favorites/status/:idVehiculo - Comprobar si un vehículo específico es favorito del usuario
// Valida el idVehiculo de la URL
router.get('/status/:idVehiculo', vehicleIdParamValidation, favoriteController.checkFavoriteStatus);

module.exports = router; 