// Ruta: ~/comparativa_proyecto/comparativa-backend/routes/listRoutes.js

const express = require('express');
const listController = require('../controllers/listController');
// Importar middleware de autenticación (todas las rutas de listas lo requieren)
const { isAuthenticated } = require('../middleware/authMiddleware');
// Importar validadores específicos para listas
const {
    createListValidation,
    updateListValidation,
    listIdParamValidation,
    vehicleToListValidation // Para añadir/quitar vehículos
} = require('../validation/listValidators');

const router = express.Router();

// Aplicar middleware isAuthenticated a TODAS las rutas definidas en este archivo
router.use(isAuthenticated);

// --- Rutas de Listas (Requieren Login) ---

// POST /api/lists - Crear una nueva lista
// Valida los datos del body
router.post('/', createListValidation, listController.createList);

// GET /api/lists - Obtener todas las listas del usuario autenticado
router.get('/', listController.getMyLists);

// GET /api/lists/:idLista - Obtener detalles de una lista específica (incluye vehículos)
// Valida el idLista de la URL
router.get('/:idLista', listIdParamValidation, listController.getListDetails);

// PUT /api/lists/:idLista - Actualizar una lista existente (nombre, descripción, etc.)
// Valida el idLista de la URL y los datos opcionales del body
router.put('/:idLista', updateListValidation, listController.updateList);

// DELETE /api/lists/:idLista - Eliminar una lista
// Valida el idLista de la URL
router.delete('/:idLista', listIdParamValidation, listController.deleteList);

// --- Rutas para gestionar vehículos dentro de una lista ---

// POST /api/lists/:idLista/vehicles/:idVehiculo - Añadir un vehículo a una lista
// Valida ambos IDs de la URL
router.post('/:idLista/vehicles/:idVehiculo', vehicleToListValidation, listController.addVehicleToList);

// DELETE /api/lists/:idLista/vehicles/:idVehiculo - Quitar un vehículo de una lista
// Valida ambos IDs de la URL
router.delete('/:idLista/vehicles/:idVehiculo', vehicleToListValidation, listController.removeVehicleFromList);

module.exports = router;