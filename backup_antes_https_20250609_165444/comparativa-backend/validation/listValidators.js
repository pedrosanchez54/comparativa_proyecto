// Ruta: ~/comparativa_proyecto/comparativa-backend/validation/listValidators.js

const { body, param } = require('express-validator');

// Validación para crear una nueva lista
const createListValidation = [
    body('nombre_lista')
      .trim()
      .notEmpty().withMessage('El nombre de la lista es requerido.')
      .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
    body('descripcion')
      .optional({ nullable: true, checkFalsy: true }) // Permite null o string vacío
      .trim()
      .isLength({ max: 500 }).withMessage('La descripción no puede exceder los 500 caracteres.'),
    body('es_publica')
      .optional() // Si no se envía, se asume false por defecto en la BD/controlador
      .isBoolean().withMessage('El valor de "es_publica" debe ser verdadero o falso.')
      .toBoolean() // Convierte 'true', 'false', 0, 1 a booleano
];

// Validación para actualizar una lista existente
const updateListValidation = [
    param('idLista').isInt().withMessage('ID de lista inválido en la URL.'), // Valida el ID en la URL
    // Los campos del body son opcionales, pero si se envían, deben ser válidos
    body('nombre_lista')
      .optional()
      .trim()
      .notEmpty().withMessage('El nombre de la lista no puede estar vacío si se proporciona.')
      .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
    body('descripcion')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 500 }).withMessage('La descripción no puede exceder los 500 caracteres.'),
    body('es_publica')
      .optional()
      .isBoolean().withMessage('El valor de "es_publica" debe ser verdadero o falso.')
      .toBoolean()
];

// Validación simple para cuando solo se necesita el ID de la lista en la URL
const listIdParamValidation = [
    param('idLista').isInt().withMessage('ID de lista inválido en la URL.')
];

// Validación para añadir/quitar un vehículo de una lista (necesita ambos IDs en la URL)
const vehicleToListValidation = [
    param('idLista').isInt().withMessage('ID de lista inválido en la URL.'),
    param('idVehiculo').isInt().withMessage('ID de vehículo inválido en la URL.')
    // Opcional: Validar el campo 'notas' si se permite añadir notas al agregar
    // body('notas').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 1000 })
];

module.exports = {
    createListValidation,
    updateListValidation,
    listIdParamValidation,
    vehicleToListValidation
};
