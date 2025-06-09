// Ruta: ~/comparativa_proyecto/comparativa-backend/validation/vehicleValidators.js

const { body, param, query } = require('express-validator');

// Valores permitidos para los campos ENUM (deben coincidir con la BD)
const vehicleTypes = ['Sedán','SUV','Deportivo','Hatchback','Coupé','Furgoneta','Urbano','Pick-up','Monovolumen','Cabrio','Familiar','Otro'];
const fuelTypes = ['Gasolina','Diésel','Híbrido','Híbrido Enchufable','Eléctrico','GLP','GNC','Hidrógeno','Otro'];
const dgtLabels = ['0','ECO','B','C','Sin etiqueta'];
const tractions = ['Delantera', 'Trasera', 'Total', 'Total Desconectable'];
const gearboxes = ['Manual', 'Automática Convertidor Par', 'Automática CVT', 'Automática Doble Embrague', 'Directa Eléctrico', 'Otra'];
const allowedSortBy = ['marca', 'modelo', 'año', 'potencia', 'precio_original', 'precio_actual_estimado', 'fecha_creacion', 'fecha_actualizacion', 'peso', 'emisiones', 'aceleracion_0_100', 'velocidad_max'];

// Validaciones comunes para campos opcionales de vehículo (usadas tanto en creación como actualización)
const commonOptionalFieldsValidation = [
    body('version').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }),
    body('pegatina_ambiental').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 20 }),
    body('velocidad_max').optional({ nullable: true, checkFalsy: true }).isInt({ min: 10, max: 550 }).toInt(),
    body('aceleracion_0_100').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0.1, max: 60 }).toFloat(),
    body('consumo_mixto').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('emisiones').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('peso').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('precio_original').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('precio_actual_estimado').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    // Campos adicionales opcionales
    body('consumo_urbano').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('consumo_extraurbano').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('distancia_frenado_100_0').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('autonomia_electrica').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('capacidad_bateria').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('tiempo_carga_ac').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body('potencia_carga_dc').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('tiempo_carga_dc_10_80').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('num_puertas').optional({ nullable: true, checkFalsy: true }).isInt({ min: 2, max: 10 }).toInt(),
    body('num_plazas').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 20 }).toInt(),
    body('vol_maletero').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('vol_maletero_max').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('dimension_largo').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('dimension_ancho').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('dimension_alto').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('distancia_entre_ejes').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).toInt(),
    body('traccion').optional({ nullable: true, checkFalsy: true }).isIn(tractions).withMessage('Tipo de tracción inválido'),
    body('caja_cambios').optional({ nullable: true, checkFalsy: true }).isIn(gearboxes).withMessage('Tipo de caja de cambios inválido'),
    body('num_marchas').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 15 }).toInt(),
    body('fecha_lanzamiento').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Fecha de lanzamiento inválida')
];

// Validación específica para crear un vehículo (requiere campos obligatorios)
const createVehicleValidation = [
    body('id_motorizacion').notEmpty().isInt().withMessage('Motorización requerida y debe ser un ID válido'),
    body('anio').notEmpty().isInt({ min: 1886, max: new Date().getFullYear() + 2 }).withMessage('Año inválido'),
    body('tipo').notEmpty().isString().isIn(vehicleTypes).withMessage('Tipo de vehículo requerido y debe ser válido'),
    ...commonOptionalFieldsValidation
];

// Validación específica para actualizar un vehículo (NO requiere id_motorizacion ya que no se puede cambiar)
const updateVehicleValidation = [
    param('id').isInt().withMessage('ID de vehículo inválido en la URL.'),
    // En actualización, todos los campos son opcionales (incluso año y tipo)
    body('anio').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1886, max: new Date().getFullYear() + 2 }).withMessage('Año inválido'),
    body('tipo').optional({ nullable: true, checkFalsy: true }).isString().isIn(vehicleTypes).withMessage('Tipo de vehículo debe ser válido'),
    ...commonOptionalFieldsValidation
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