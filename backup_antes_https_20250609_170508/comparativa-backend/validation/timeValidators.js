// Ruta: ~/comparativa_proyecto/comparativa-backend/validation/timeValidators.js

const { body, param } = require('express-validator');

// Expresión regular para validar formato MM:SS.ms (ej: 07:35.123) o 00:MM:SS.ms (ej: 00:07:35.123)
// Solo minutos:segundos.milisegundos ya que ningún circuito toma más de una hora
// Acepta tanto MM:SS.ms como 00:MM:SS.ms para compatibilidad con MySQL TIME
const timeRegex = /^(\d{2}:\d{2}\.\d{1,3}|00:\d{2}:\d{2}\.\d{1,3})$/;
const allowedConditions = ['Seco','Mojado','Húmedo','Mixto','Nieve/Hielo'];

// Validación específica para el parámetro idVehiculo en rutas de tiempo
const vehicleIdTimeParamValidation = [
    param('idVehiculo').isInt().withMessage('ID de vehículo inválido en la URL.')
];

// Validación para añadir un nuevo tiempo de circuito
const createTimeValidation = [
    body('circuito')
      .trim()
      .notEmpty().withMessage('El nombre del circuito es requerido.')
      .isLength({ min: 3, max: 100 }).withMessage('Nombre de circuito inválido.'),
    body('tiempo_vuelta')
      .matches(timeRegex).withMessage('Formato de tiempo inválido. Use MM:SS.ms (ej: 09:14.930) o 00:MM:SS.ms (ej: 00:09:14.930)'),
    body('condiciones')
      .optional({ nullable: true, checkFalsy: true }) // Permitir vacío o null (usará default 'Seco' de BD)
      .isIn(allowedConditions).withMessage('Condiciones inválidas.'),
    body('fecha_record')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Formato de fecha inválido (YYYY-MM-DD).')
      .toDate(), // Convierte a objeto Date
    body('piloto')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 100 }).withMessage('Nombre de piloto demasiado largo.'),
    body('neumaticos')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 100 }).withMessage('Descripción de neumáticos demasiado larga.'),
    body('fuente_url')
      .optional({ nullable: true, checkFalsy: true })
      .isURL().withMessage('URL de la fuente inválida.')
];

// Validación para cuando solo se necesita el ID del tiempo en la URL (ej. DELETE)
 const timeIdParamValidation = [
    param('idTiempo').isInt().withMessage('ID de tiempo inválido en la URL.'),
];

module.exports = {
    createTimeValidation,
    timeIdParamValidation,
    vehicleIdTimeParamValidation
};