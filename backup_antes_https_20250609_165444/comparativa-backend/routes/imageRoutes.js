// Ruta: ~/comparativa_proyecto/comparativa-backend/routes/imageRoutes.js

const express = require('express');
const imageController = require('../controllers/imageController');
// Importar middlewares de autenticación y autorización
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
// Importar validadores específicos para imágenes y ID de vehículo
const { addImageValidation, imageIdParamValidation } = require('../validation/imageValidators');
const { vehicleIdParamValidation } = require('../validation/vehicleValidators'); // Reutiliza validador de ID vehículo

const router = express.Router();

// --- Rutas Públicas ---

// GET /api/images/vehicle/:idVehiculo - Obtener todas las imágenes de un vehículo específico
// Valida el idVehiculo de la URL
router.get('/vehicle/:idVehiculo', vehicleIdParamValidation, imageController.getVehicleImages);

// --- Rutas Protegidas (Requieren rol de Administrador) ---

// POST /api/images/vehicle/:idVehiculo - Añadir una nueva imagen a un vehículo
// Requiere login, ser admin, valida el ID de vehículo y los datos del body
router.post('/vehicle/:idVehiculo', isAuthenticated, isAdmin, vehicleIdParamValidation, addImageValidation, imageController.addImage);

// DELETE /api/images/:idImagen - Eliminar una imagen específica por su ID
// Requiere login, ser admin y valida el idImagen de la URL
router.delete('/:idImagen', isAuthenticated, isAdmin, imageIdParamValidation, imageController.deleteImage);

module.exports = router; 