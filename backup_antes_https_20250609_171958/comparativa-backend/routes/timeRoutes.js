// Ruta: ~/comparativa_proyecto/comparativa-backend/routes/timeRoutes.js

const express = require('express');
const timeController = require('../controllers/timeController');
// Importar middlewares de autenticación y autorización (isAdmin para crear/borrar)
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
// Importar validadores específicos para tiempos
const { createTimeValidation, timeIdParamValidation, vehicleIdTimeParamValidation } = require('../validation/timeValidators');

const router = express.Router();

// --- Rutas Públicas ---

// GET /api/times/vehicle/:idVehiculo - Obtener todos los tiempos de un vehículo específico
// Valida el idVehiculo de la URL
router.get('/vehicle/:idVehiculo', vehicleIdTimeParamValidation, timeController.getVehicleTimes);

// --- Rutas Protegidas (Requieren rol de Administrador) ---

// POST /api/times/vehicle/:idVehiculo - Añadir un nuevo tiempo de circuito a un vehículo
// Requiere login, ser admin, valida el ID de vehículo y los datos del body
router.post('/vehicle/:idVehiculo', isAuthenticated, isAdmin, vehicleIdTimeParamValidation, createTimeValidation, timeController.addCircuitTime);

// DELETE /api/times/:idTiempo - Eliminar un tiempo de circuito específico por su ID
// Requiere login, ser admin y valida el idTiempo de la URL
router.delete('/:idTiempo', isAuthenticated, isAdmin, timeIdParamValidation, timeController.deleteCircuitTime);

module.exports = router;