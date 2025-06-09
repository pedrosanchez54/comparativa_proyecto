// Ruta: ~/comparativa_proyecto/comparativa-backend/routes/vehicleRoutes.js

const express = require('express');
const vehicleController = require('../controllers/vehicleController');
// Importar middlewares de autenticación y autorización
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
// Importar validadores específicos para vehículos
const {
    createVehicleValidation,
    updateVehicleValidation,
    getVehiclesQueryValidation,
    vehicleIdParamValidation // Para rutas que usan /:id
} = require('../validation/vehicleValidators');

const router = express.Router();

// --- Rutas Públicas (No requieren login) ---

// GET /api/vehicles - Obtener lista de vehículos
// Valida los parámetros de consulta (filtros, paginación, ordenación)
router.get('/', getVehiclesQueryValidation, vehicleController.getVehicles);

// GET /api/vehicles/options - Obtener listas de opciones para los filtros (marcas, tipos, etc.)
router.get('/options', vehicleController.getFilterOptions);

// GET /api/vehicles/compare - Obtener múltiples vehículos para comparación
// Query param: ?ids=1,2,3,4
router.get('/compare', vehicleController.getVehiclesForComparison);

// GET /api/vehicles/:id - Obtener detalles de un vehículo específico por ID
// Valida que el 'id' en la URL sea un entero
router.get('/:id', vehicleIdParamValidation, vehicleController.getVehicleById);

// --- Rutas Protegidas (Requieren rol de Administrador) ---
// Aplicar middlewares isAuthenticated e isAdmin a las siguientes rutas

// POST /api/vehicles - Crear un nuevo vehículo
// Requiere login, ser admin y valida los datos del body
router.post('/', isAuthenticated, isAdmin, createVehicleValidation, vehicleController.createVehicle);

// PUT /api/vehicles/:id - Actualizar un vehículo existente
// Requiere login, ser admin, valida el ID de la URL y los datos del body
router.put('/:id', isAuthenticated, isAdmin, updateVehicleValidation, vehicleController.updateVehicle);

// DELETE /api/vehicles/:id - Eliminar un vehículo
// Requiere login, ser admin y valida el ID de la URL
router.delete('/:id', isAuthenticated, isAdmin, vehicleIdParamValidation, vehicleController.deleteVehicle);

module.exports = router; 