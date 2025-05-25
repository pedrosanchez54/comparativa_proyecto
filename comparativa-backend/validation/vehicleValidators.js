// Ruta: ~/comparativa_proyecto/comparativa-backend/validation/vehicleValidators.js

const { body, param, query } = require('express-validator');

// Valores permitidos para los campos ENUM (deben coincidir con la BD)
const vehicleTypes = ['Sedán','SUV','Deportivo','Hatchback','Coupé','Furgoneta','Urbano','Pick-up','Monovolumen','Cabrio','Familiar','Otro'];
const fuelTypes = ['Gasolina','Diésel','Híbrido','Híbrido Enchufable','Eléctrico','GLP','GNC','Hidrógeno','Otro'];
const dgtLabels = ['0','ECO','B','C','Sin etiqueta'];
const tractions = ['Delantera', 'Trasera', 'Total', 'Total Desconectable'];
const gearboxes = ['Manual', 'Automática Convertidor Par', 'Automática CVT', 'Automática Doble Embrague', 'Directa Eléctrico', 'Otra'];
const allowedSortBy = ['marca', 'modelo', 'año', 'potencia', 'precio_original', 'precio_actual_estimado', 'fecha_creacion', 'fecha_actualizacion', 'peso', 'emisiones', 'aceleracion_0_100', 'velocidad_max'];

// Validaciones comunes para campos de vehículo (usadas en creación y actualización)
const commonVehicleFieldsValidation = [
    body('id_motorizacion').notEmpty().isInt().withMessage('Motorización requerida y debe ser un ID válido'),
    body('anio').notEmpty().isInt({ min: 1886, max: new Date().getFullYear() + 2 }).withMessage('Año inválido'),
    body('tipo').notEmpty().isString().isLength({ max: 50 }),
    body('version').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }),
    body('pegatina_ambiental').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 20 }),
    body('velocidad_max').optional({ nullable: true, checkFalsy: true }).isInt({ min: 10, max: 550 }).toInt(),
    body('aceleracion_0_100').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0.1, max: 60 }).toFloat(),
    body('consumo_mixto').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('emisiones').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('peso').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('precio_original').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('precio_actual_estimado').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    // Añadir el resto de campos de la tabla Vehiculo según la nueva estructura
];

// Validación específica para crear un vehículo (usa las comunes)
const createVehicleValidation = [
    ...commonVehicleFieldsValidation
    // Aquí podrías añadir reglas específicas solo para la creación si las hubiera
];

// Validación específica para actualizar un vehículo (valida ID y usa las comunes)
const updateVehicleValidation = [
    param('id').isInt().withMessage('ID de vehículo inválido en la URL.'), // Valida el ID que viene en la URL
    ...commonVehicleFieldsValidation
    // Aquí podrías añadir reglas específicas solo para la actualización
];

// Validación para los parámetros de consulta (query params) al obtener la lista de vehículos
const getVehiclesQueryValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Número de página inválido.').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite por página inválido (1-100).').toInt(),
    query('sortBy').optional().isString().trim().isIn(allowedSortBy).withMessage('Campo de ordenación no válido.'),
    query('sortOrder').optional().isString().trim().toUpperCase().isIn(['ASC', 'DESC']).withMessage('Orden de clasificación inválido (ASC o DESC).'),
    // Validar filtros de rango (opcionales, deben ser números)
    query('añoMin').optional().isInt({ min: 1886 }).withMessage('Año mínimo inválido.').toInt(),
    query('añoMax').optional().isInt().withMessage('Año máximo inválido.').toInt(),
    query('potMin').optional().isInt({ min: 0 }).withMessage('Potencia mínima inválida.').toInt(),
    query('potMax').optional().isInt().withMessage('Potencia máxima inválida.').toInt(),
    query('precioMin').optional().isFloat({ min: 0 }).withMessage('Precio mínimo inválido.').toFloat(),
    query('precioMax').optional().isFloat().withMessage('Precio máximo inválido.').toFloat(),
    query('pesoMin').optional().isInt({ min: 0 }).withMessage('Peso mínimo inválido.').toInt(),
    query('pesoMax').optional().isInt().withMessage('Peso máximo inválido.').toInt(),
    // Validar filtros de texto/enum (opcionales)
    query('searchText').optional().isString().trim().escape(), // Escapar caracteres HTML/JS
    query('marca').optional().isString().trim().escape(),
    query('modelo').optional().isString().trim().escape(),
    query('tipo').optional().isIn(vehicleTypes).withMessage('Tipo de vehículo inválido en filtro.'),
    query('combustible').optional().isIn(fuelTypes).withMessage('Tipo de combustible inválido en filtro.'),
    query('pegatina').optional().isIn(dgtLabels).withMessage('Etiqueta DGT inválida en filtro.'), // 'pegatina' debe coincidir con el query param usado
    query('traccion').optional().isIn(tractions).withMessage('Tipo de tracción inválido en filtro.'),
    query('caja_cambios').optional().isIn(gearboxes).withMessage('Tipo de caja de cambios inválida en filtro.'),
    query('num_puertas').optional().isInt({ min: 0 }).withMessage('Número de puertas inválido en filtro.').toInt(),
    query('num_plazas').optional().isInt({ min: 1 }).withMessage('Número de plazas inválido en filtro.').toInt(),
];

// Validación simple para cuando solo se necesita el ID del vehículo en la URL (ej. GET por ID, DELETE)
const vehicleIdParamValidation = [
     param('id').isInt().withMessage('ID de vehículo inválido en la URL.'),
];


module.exports = {
    createVehicleValidation,
    updateVehicleValidation,
    getVehiclesQueryValidation,
    vehicleIdParamValidation
}; 