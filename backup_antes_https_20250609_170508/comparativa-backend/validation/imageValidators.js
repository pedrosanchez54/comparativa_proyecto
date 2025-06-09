// Ruta: ~/comparativa_proyecto/comparativa-backend/validation/imageValidators.js

const { body, param } = require('express-validator');

// Validación para añadir una nueva imagen a un vehículo
const addImageValidation = [
    // El ID del vehículo viene en la URL, se valida en la ruta
    body('url')
      .trim()
      .notEmpty().withMessage('La URL de la imagen es requerida.')
      .isURL().withMessage('Se requiere una URL válida para la imagen.'),
    body('descripcion')
      .optional({nullable: true, checkFalsy: true}) // Descripción opcional
      .trim()
      .isLength({ max: 100 }).withMessage('La descripción no puede exceder los 100 caracteres.'),
    body('orden')
      .optional() // Orden opcional (default será 0)
      .isInt({ min: 0 }).withMessage('El orden debe ser un número entero no negativo.')
      .toInt() // Convertir a entero
];

// Validación para cuando solo se necesita el ID de la imagen en la URL (ej. DELETE)
const imageIdParamValidation = [
    param('idImagen').isInt().withMessage('ID de imagen inválido en la URL.')
];

module.exports = {
    addImageValidation,
    imageIdParamValidation
}; 