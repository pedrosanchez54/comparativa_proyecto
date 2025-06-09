const { param } = require('express-validator');

// Validación para cuando se necesita el ID del vehículo en la URL para operaciones de favoritos
const vehicleIdParamValidation = [
    param('idVehiculo').isInt().withMessage('ID de vehículo inválido en la URL.')
];

// No se necesitan validaciones de body aquí porque las acciones (añadir/quitar)
// solo dependen del ID en la URL y del usuario autenticado en la sesión.

module.exports = {
    vehicleIdParamValidation // Reutilizamos el nombre para consistencia si se importa junto a otros
}; 