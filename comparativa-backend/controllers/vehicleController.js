// Ruta: ~/comparativa_proyecto/comparativa-backend/controllers/vehicleController.js

const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

/**
 * Helper para construir la cláusula WHERE y los parámetros para filtrar vehículos.
 * @param {object} queryParams - Objeto con los parámetros de la query (req.query).
 * @returns {{whereClause: string, params: array}} Objeto con la cláusula WHERE y el array de parámetros.
 */
function buildWhereClause(queryParams) {
    let whereClause = ' WHERE 1=1';
    const params = [];
    const {
        id_marca, id_modelo, id_generacion, id_motorizacion,
<<<<<<< HEAD
        combustible, pegatina_ambiental, traccion, caja_cambios, num_puertas, num_plazas,
        anioMin, anioMax, potenciaMin, potenciaMax, precioMin, precioMax
=======
        tipo, combustible, pegatina_ambiental, traccion, caja_cambios, num_puertas, num_plazas,
        añoMin, añoMax, potMin, potMax, precioMin, precioMax, pesoMin, pesoMax,
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
    } = queryParams;

    if (id_marca)        { whereClause += ' AND m.id_marca = ?'; params.push(id_marca); }
    if (id_modelo)       { whereClause += ' AND mo.id_modelo = ?'; params.push(id_modelo); }
    if (id_generacion)   { whereClause += ' AND g.id_generacion = ?'; params.push(id_generacion); }
    if (id_motorizacion) { whereClause += ' AND mt.id_motorizacion = ?'; params.push(id_motorizacion); }
<<<<<<< HEAD
=======
    if (tipo)            { whereClause += ' AND v.tipo = ?'; params.push(tipo); }
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
    if (combustible)     { whereClause += ' AND mt.combustible = ?'; params.push(combustible); }
    if (pegatina_ambiental) { whereClause += ' AND v.pegatina_ambiental = ?'; params.push(pegatina_ambiental); }
    if (traccion)        { whereClause += ' AND v.traccion = ?'; params.push(traccion); }
    if (caja_cambios)    { whereClause += ' AND v.caja_cambios = ?'; params.push(caja_cambios); }
    if (num_puertas)     { whereClause += ' AND v.num_puertas = ?'; params.push(num_puertas); }
    if (num_plazas)      { whereClause += ' AND v.num_plazas = ?'; params.push(num_plazas); }
<<<<<<< HEAD
    if (anioMin)         { whereClause += ' AND v.anio >= ?'; params.push(anioMin); }
    if (anioMax)         { whereClause += ' AND v.anio <= ?'; params.push(anioMax); }
    if (potenciaMin)     { whereClause += ' AND mt.potencia >= ?'; params.push(potenciaMin); }
    if (potenciaMax)     { whereClause += ' AND mt.potencia <= ?'; params.push(potenciaMax); }
    if (precioMin)       { whereClause += ' AND v.precio_original >= ?'; params.push(precioMin); }
    if (precioMax)       { whereClause += ' AND v.precio_original <= ?'; params.push(precioMax); }
=======
    if (añoMin)          { whereClause += ' AND v.anio >= ?'; params.push(añoMin); }
    if (añoMax)          { whereClause += ' AND v.anio <= ?'; params.push(añoMax); }
    if (potMin)          { whereClause += ' AND mt.potencia >= ?'; params.push(potMin); }
    if (potMax)          { whereClause += ' AND mt.potencia <= ?'; params.push(potMax); }
    if (precioMin)       { whereClause += ' AND v.precio_original >= ?'; params.push(precioMin); }
    if (precioMax)       { whereClause += ' AND v.precio_original <= ?'; params.push(precioMax); }
    if (pesoMin)         { whereClause += ' AND v.peso >= ?'; params.push(pesoMin); }
    if (pesoMax)         { whereClause += ' AND v.peso <= ?'; params.push(pesoMax); }
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
    return { whereClause, params };
}

/**
 * Crea un nuevo vehículo. Requiere rol de administrador.
 */
exports.createVehicle = async (req, res, next) => {
<<<<<<< HEAD
=======
    // 1. Validar datos de entrada
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

<<<<<<< HEAD
    const vehicleData = {};
    const allowedFields = [
        'id_motorizacion', 'anio', 'version', 'pegatina_ambiental',
        'velocidad_max', 'aceleracion_0_100', 'consumo_mixto',
        'emisiones', 'num_puertas', 'num_plazas', 'traccion',
        'caja_cambios', 'precio_original'
    ];

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            vehicleData[field] = req.body[field] === '' ? null : req.body[field];
        }
    }

    if (!vehicleData.id_motorizacion || !vehicleData.anio) {
        return res.status(400).json({ message: 'Faltan campos obligatorios (id_motorizacion, anio).' });
    }

    const sql = 'INSERT INTO Vehiculo SET ?';

    try {
        const [result] = await pool.query(sql, vehicleData);
        res.status(201).json({ message: 'Vehículo creado correctamente.', vehicleId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Error: Posible vehículo duplicado detectado.' });
        }
        console.error("Error creando vehículo:", error);
        next(error);
=======
    // 2. Construir objeto con los datos del body permitidos
    const vehicleData = {};
    // Lista de campos permitidos que coinciden con las columnas de la tabla Vehiculos
    const allowedFields = ['marca', 'modelo', 'version', 'año', 'tipo', 'combustible', 'pegatina_ambiental', 'potencia', 'par_motor', 'velocidad_max', 'aceleracion_0_100', 'distancia_frenado_100_0', 'consumo_urbano', 'consumo_extraurbano', 'consumo_mixto', 'emisiones', 'autonomia_electrica', 'capacidad_bateria', 'tiempo_carga_ac', 'potencia_carga_dc', 'tiempo_carga_dc_10_80', 'peso', 'num_puertas', 'num_plazas', 'vol_maletero', 'vol_maletero_max', 'dimension_largo', 'dimension_ancho', 'dimension_alto', 'distancia_entre_ejes', 'traccion', 'caja_cambios', 'num_marchas', 'precio_original', 'precio_actual_estimado', 'fecha_lanzamiento'];

    for (const field of allowedFields) {
        // Incluir el campo solo si está presente en el body (incluso si es null o vacío)
        // La validación ya se encargó de tipos y formatos básicos
        if (req.body[field] !== undefined) {
            // Convertir strings vacíos a NULL para campos que lo permitan en BD
            vehicleData[field] = req.body[field] === '' ? null : req.body[field];
        }
    }
    // Soporte para campo 'detalle' (JSON)
    if (req.body.detalle !== undefined) {
        try {
            vehicleData.detalle = typeof req.body.detalle === 'object'
                ? JSON.stringify(req.body.detalle)
                : req.body.detalle;
        } catch (e) {
            return res.status(400).json({ message: 'El campo detalle debe ser un objeto JSON válido.' });
        }
    } else {
        vehicleData.detalle = null;
    }

    // 3. Validar campos obligatorios específicos (además de la validación de formato)
     if (!vehicleData.marca || !vehicleData.modelo || !vehicleData.año || !vehicleData.tipo || !vehicleData.combustible) {
         return res.status(400).json({ message: 'Faltan campos obligatorios (marca, modelo, año, tipo, combustible).' });
     }

    // 4. Insertar en la base de datos
    const sql = 'INSERT INTO Vehiculo SET ?'; // Usar SET ? es conveniente para insertar objetos

    try {
        const [result] = await pool.query(sql, vehicleData);
        res.status(201).json({ message: 'Vehículo creado correctamente.', vehicleId: result.insertId }); // 201 Created
    } catch (error) {
         // Manejar error de duplicado si existe una constraint UNIQUE en la BD
         if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'Error: Posible vehículo duplicado detectado (ej. misma marca, modelo, versión y año).' }); // 409 Conflict
         }
         console.error("Error creando vehículo:", error);
        next(error); // Pasar al manejador de errores general
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
    }
};

/**
 * Obtiene una lista de vehículos con filtros, paginación y ordenación.
 */
exports.getVehicles = async (req, res, next) => {
<<<<<<< HEAD
    const { page = 1, limit = 12, sortBy = 'marca', sortOrder = 'ASC' } = req.query;
    const offset = (page - 1) * limit;
    const { whereClause, params } = buildWhereClause(req.query);
    
    // Mapeo de campos de ordenación a sus nombres completos en la consulta
    const sortByMap = {
        'marca': 'm.nombre',
        'modelo': 'mo.nombre',
        'generacion': 'g.nombre',
        'motorizacion': 'mt.nombre',
        'anio': 'v.anio',
        'potencia': 'mt.potencia',
        'precio_original': 'v.precio_original',
        'velocidad_max': 'v.velocidad_max',
        'aceleracion_0_100': 'v.aceleracion_0_100',
        'consumo_mixto': 'v.consumo_mixto',
        'emisiones': 'v.emisiones'
    };

    const safeSortBy = sortByMap[sortBy] || 'm.nombre';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const countSql = `SELECT COUNT(DISTINCT v.id_vehiculo) as total FROM Vehiculo v
=======
    const { page = 1, limit = 12, sortBy = 'm.nombre', sortOrder = 'ASC' } = req.query;
    const offset = (page - 1) * limit;
    const { whereClause, params } = buildWhereClause(req.query);
    const allowedSortBy = ['m.nombre','mo.nombre','g.nombre','mt.nombre','v.anio','mt.potencia','v.precio_original','v.precio_actual_estimado'];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'm.nombre';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    // Query con JOINs para devolver datos anidados
    const countSql = `SELECT COUNT(*) as total FROM Vehiculo v
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
        JOIN Motorizacion mt ON v.id_motorizacion = mt.id_motorizacion
        JOIN Generacion g ON mt.id_generacion = g.id_generacion
        JOIN Modelo mo ON g.id_modelo = mo.id_modelo
        JOIN Marca m ON mo.id_marca = m.id_marca
        ${whereClause}`;
<<<<<<< HEAD

    const dataSql = `SELECT DISTINCT
        v.id_vehiculo, v.anio, v.version, v.pegatina_ambiental, 
        v.velocidad_max, v.aceleracion_0_100, v.consumo_mixto, 
        v.emisiones, v.num_puertas, v.num_plazas, v.traccion, 
        v.caja_cambios, v.precio_original,
        m.id_marca, m.nombre AS marca,
        mo.id_modelo, mo.nombre AS modelo,
        g.id_generacion, g.nombre AS generacion,
        mt.id_motorizacion, mt.nombre AS motorizacion, 
        mt.combustible, mt.potencia, mt.par_motor,
=======
    const dataSql = `SELECT v.id_vehiculo, v.anio, v.tipo, v.version, v.pegatina_ambiental, v.velocidad_max, v.aceleracion_0_100, v.consumo_mixto, v.emisiones, v.peso, v.precio_original, v.precio_actual_estimado,
        m.id_marca, m.nombre AS marca,
        mo.id_modelo, mo.nombre AS modelo,
        g.id_generacion, g.nombre AS generacion,
        mt.id_motorizacion, mt.codigo_motor, mt.nombre AS motorizacion, mt.combustible, mt.potencia, mt.par_motor, mt.cilindrada, mt.num_cilindros, mt.arquitectura,
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
        (SELECT ruta_local FROM Imagenes i WHERE i.id_vehiculo = v.id_vehiculo ORDER BY i.orden ASC LIMIT 1) as imagen_principal
        FROM Vehiculo v
        JOIN Motorizacion mt ON v.id_motorizacion = mt.id_motorizacion
        JOIN Generacion g ON mt.id_generacion = g.id_generacion
        JOIN Modelo mo ON g.id_modelo = mo.id_modelo
        JOIN Marca m ON mo.id_marca = m.id_marca
        ${whereClause}
        ORDER BY ${safeSortBy} ${safeSortOrder}
        LIMIT ? OFFSET ?`;
<<<<<<< HEAD

    try {
        console.log('Executing count query:', countSql, 'with params:', params);
        const [countResult] = await pool.query(countSql, params);
        
        const queryParams = [...params, parseInt(limit, 10), parseInt(offset, 10)];
        console.log('Executing data query:', dataSql, 'with params:', queryParams);
        const [vehicles] = await pool.query(dataSql, queryParams);

        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

=======
    try {
        const [[countResult], [vehicles]] = await Promise.all([
            pool.query(countSql, params),
            pool.query(dataSql, [...params, parseInt(limit, 10), parseInt(offset, 10)])
        ]);
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
        res.status(200).json({
            message: `Encontrados ${totalItems} vehículos`,
            data: vehicles,
            pagination: {
                currentPage: parseInt(page, 10),
                totalPages,
                totalItems,
                itemsPerPage: parseInt(limit, 10)
            }
        });
    } catch (error) {
<<<<<<< HEAD
        console.error("Error detallado al obtener vehículos:", error);
        console.error("SQL State:", error.sqlState);
        console.error("Error Code:", error.code);
        console.error("SQL Message:", error.sqlMessage);
=======
        console.error("Error obteniendo vehículos:", error);
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
        next(error);
    }
};

/**
 * Obtiene los detalles completos de un vehículo por su ID.
 */
exports.getVehicleById = async (req, res, next) => {
    const { id } = req.params;
<<<<<<< HEAD
    const vehicleSql = `SELECT 
        v.id_vehiculo, v.anio, v.version, v.pegatina_ambiental, 
        v.velocidad_max, v.aceleracion_0_100, v.consumo_mixto, 
        v.emisiones, v.num_puertas, v.num_plazas, v.traccion, 
        v.caja_cambios, v.precio_original,
        m.id_marca, m.nombre AS marca,
        mo.id_modelo, mo.nombre AS modelo,
        g.id_generacion, g.nombre AS generacion,
        mt.id_motorizacion, mt.nombre AS motorizacion, 
        mt.combustible, mt.potencia, mt.par_motor
=======
    const vehicleSql = `SELECT v.*, m.nombre AS marca, mo.nombre AS modelo, g.nombre AS generacion, mt.*
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
        FROM Vehiculo v
        JOIN Motorizacion mt ON v.id_motorizacion = mt.id_motorizacion
        JOIN Generacion g ON mt.id_generacion = g.id_generacion
        JOIN Modelo mo ON g.id_modelo = mo.id_modelo
        JOIN Marca m ON mo.id_marca = m.id_marca
        WHERE v.id_vehiculo = ? LIMIT 1`;
    const imagesSql = 'SELECT id_imagen, ruta_local, descripcion, orden FROM Imagenes WHERE id_vehiculo = ? ORDER BY orden ASC';
<<<<<<< HEAD
=======
    const timesSql = 'SELECT * FROM Tiempos_Circuito WHERE id_vehiculo = ? ORDER BY circuito ASC, tiempo_vuelta ASC';
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
    try {
        const [vehicleResult] = await pool.query(vehicleSql, [id]);
        if (vehicleResult.length === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado.' });
        }
        const vehicle = vehicleResult[0];
        const [images] = await pool.query(imagesSql, [id]);
<<<<<<< HEAD
        vehicle.imagenes = images;
=======
        const [times] = await pool.query(timesSql, [id]);
        vehicle.imagenes = images;
        vehicle.tiempos_circuito = times;
        // Parsear campo detalle si existe y es string
        if (vehicle.detalle) {
            try {
                vehicle.detalle = typeof vehicle.detalle === 'string' ? JSON.parse(vehicle.detalle) : vehicle.detalle;
            } catch (e) {
                // Si no es JSON válido, dejarlo como string
            }
        }
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
        res.status(200).json({ message: 'Vehículo encontrado.', data: vehicle });
    } catch (error) {
        console.error(`Error obteniendo vehículo con ID ${id}:`, error);
        next(error);
    }
};

/**
 * Actualiza un vehículo existente. Requiere rol de administrador.
 */
exports.updateVehicle = async (req, res, next) => {
<<<<<<< HEAD
=======
    // 1. Validar ID de URL y datos del body
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
<<<<<<< HEAD

    const { id } = req.params;
    const vehicleData = {};
    const allowedFields = [
        'id_motorizacion', 'anio', 'version', 'pegatina_ambiental',
        'velocidad_max', 'aceleracion_0_100', 'consumo_mixto',
        'emisiones', 'num_puertas', 'num_plazas', 'traccion',
        'caja_cambios', 'precio_original'
    ];

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            vehicleData[field] = req.body[field] === '' ? null : req.body[field];
        }
    }

    if (Object.keys(vehicleData).length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
    }

=======
    const { id } = req.params;

    // 2. Construir objeto con los datos a actualizar (solo los presentes en el body)
     const vehicleData = {};
     const allowedFields = ['marca', 'modelo', 'version', 'año', 'tipo', 'combustible', 'pegatina_ambiental', 'potencia', 'par_motor', 'velocidad_max', 'aceleracion_0_100', 'distancia_frenado_100_0', 'consumo_urbano', 'consumo_extraurbano', 'consumo_mixto', 'emisiones', 'autonomia_electrica', 'capacidad_bateria', 'tiempo_carga_ac', 'potencia_carga_dc', 'tiempo_carga_dc_10_80', 'peso', 'num_puertas', 'num_plazas', 'vol_maletero', 'vol_maletero_max', 'dimension_largo', 'dimension_ancho', 'dimension_alto', 'distancia_entre_ejes', 'traccion', 'caja_cambios', 'num_marchas', 'precio_original', 'precio_actual_estimado', 'fecha_lanzamiento'];

     for (const field of allowedFields) {
         if (req.body[field] !== undefined) {
             // Convertir strings vacíos a NULL para campos que lo permitan
             vehicleData[field] = req.body[field] === '' ? null : req.body[field];
         }
     }
     // Soporte para campo 'detalle' (JSON)
     if (req.body.detalle !== undefined) {
         try {
             vehicleData.detalle = typeof req.body.detalle === 'object'
                 ? JSON.stringify(req.body.detalle)
                 : req.body.detalle;
         } catch (e) {
             return res.status(400).json({ message: 'El campo detalle debe ser un objeto JSON válido.' });
         }
     }

    // 3. Verificar que hay algo que actualizar
     if (Object.keys(vehicleData).length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
     }
     // Nota: La columna `fecha_actualizacion` se actualiza automáticamente por `ON UPDATE CURRENT_TIMESTAMP` en la BD.

    // 4. Ejecutar la actualización en la BD
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
    const sql = 'UPDATE Vehiculo SET ? WHERE id_vehiculo = ?';

    try {
        const [result] = await pool.query(sql, [vehicleData, id]);

<<<<<<< HEAD
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado para actualizar.' });
        }

        res.status(200).json({ message: 'Vehículo actualizado correctamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Error: La actualización crearía un vehículo duplicado.' });
        }
=======
        // 5. Comprobar si se afectó alguna fila
        if (result.affectedRows === 0) {
            // Si no se afectó, el vehículo con ese ID no existía
            return res.status(404).json({ message: 'Vehículo no encontrado para actualizar.' });
        }

        // 6. Opcional: Devolver el vehículo actualizado consultándolo de nuevo
        // const [updatedVehicle] = await pool.query('SELECT * FROM Vehiculos WHERE id_vehiculo = ?', [id]);
        // res.status(200).json({ message: 'Vehículo actualizado correctamente.', data: updatedVehicle[0] });

        // O simplemente devolver éxito
         res.status(200).json({ message: 'Vehículo actualizado correctamente.' });

    } catch (error) {
         if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'Error: La actualización crearía un vehículo duplicado.' });
         }
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
        console.error(`Error actualizando vehículo ID ${id}:`, error);
        next(error);
    }
};

<<<<<<< HEAD
exports.getFilterOptions = async (req, res, next) => {
    try {
        const [[marcas], [modelos], [generaciones], [motorizaciones], [combustibles]] = await Promise.all([
            pool.query('SELECT id_marca, nombre FROM Marca ORDER BY nombre ASC'),
            pool.query('SELECT id_modelo, nombre, id_marca FROM Modelo ORDER BY nombre ASC'),
            pool.query('SELECT id_generacion, nombre, id_modelo FROM Generacion ORDER BY nombre ASC'),
            pool.query('SELECT id_motorizacion, nombre, id_generacion, combustible, potencia FROM Motorizacion ORDER BY nombre ASC'),
=======
/**
 * Elimina un vehículo. Requiere rol de administrador.
 */
exports.deleteVehicle = async (req, res, next) => {
    // 1. Validar ID de la URL
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
     }
    const { id } = req.params;

    // 2. Ejecutar DELETE en la BD
    const sql = 'DELETE FROM Vehiculo WHERE id_vehiculo = ?';

    try {
        const [result] = await pool.query(sql, [id]);

        // 3. Comprobar si se eliminó algo
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado para eliminar.' });
        }

        // Nota: Las tablas relacionadas (Imagenes, Tiempos_Circuito, Vehiculos_Listas, Favoritos)
        // deberían tener definida la clave foránea con `ON DELETE CASCADE`
        // para que MySQL borre automáticamente los registros asociados.

        // 4. Enviar respuesta de éxito
        res.status(200).json({ message: `Vehículo con ID ${id} eliminado correctamente.` });
        // Alternativa: res.status(204).send(); // 204 No Content (sin cuerpo de respuesta)

    } catch (error) {
        console.error(`Error eliminando vehículo ID ${id}:`, error);
        next(error);
    }
};

/**
 * Obtiene listas de valores únicos para los filtros del frontend.
 */
exports.getFilterOptions = async (req, res, next) => {
    try {
        const [[marcas], [modelos], [generaciones], [motorizaciones], [tipos], [combustibles]] = await Promise.all([
            pool.query('SELECT id_marca, nombre FROM Marca ORDER BY nombre ASC'),
            pool.query('SELECT id_modelo, nombre, id_marca FROM Modelo ORDER BY nombre ASC'),
            pool.query('SELECT id_generacion, nombre, id_modelo FROM Generacion ORDER BY nombre ASC'),
            pool.query('SELECT id_motorizacion, nombre, id_generacion, codigo_motor, combustible, potencia FROM Motorizacion ORDER BY nombre ASC'),
            pool.query('SELECT DISTINCT tipo FROM Vehiculo ORDER BY tipo ASC'),
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
            pool.query('SELECT DISTINCT combustible FROM Motorizacion ORDER BY combustible ASC')
        ]);
        res.status(200).json({
            marcas,
            modelos,
            generaciones,
            motorizaciones,
<<<<<<< HEAD
=======
            tipos: tipos.map(t => t.tipo),
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
            combustibles: combustibles.map(c => c.combustible)
        });
    } catch (error) {
        console.error("Error obteniendo opciones de filtro:", error);
        next(error);
    }
};

<<<<<<< HEAD
exports.getVehiclesForComparison = async (req, res, next) => {
=======
/**
 * Obtiene los datos completos de un conjunto de vehículos por sus IDs,
 * optimizado para la página de comparación.
 */
 exports.getVehiclesForComparison = async (req, res, next) => {
    // 1. Obtener y validar IDs del query string (ej. ?ids=1,5,23)
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
    const { ids } = req.query;

    if (!ids) {
        return res.status(400).json({ message: 'Se requiere una lista de IDs de vehículos (parámetro ?ids=...).' });
    }

<<<<<<< HEAD
    const vehicleIds = ids.split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id) && id > 0);
=======
    // Convertir string a array de números, limpiando y filtrando IDs inválidos o no numéricos
    const vehicleIds = ids.split(',')
                        .map(id => parseInt(id.trim(), 10))
                        .filter(id => !isNaN(id) && id > 0);
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445

    if (vehicleIds.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron IDs de vehículos válidos.' });
    }

<<<<<<< HEAD
    const MAX_COMPARE = 4;
    const limitedIds = vehicleIds.slice(0, MAX_COMPARE);

    const sql = `SELECT 
        v.id_vehiculo, v.anio, v.version, v.pegatina_ambiental, 
        v.velocidad_max, v.aceleracion_0_100, v.consumo_mixto, 
        v.emisiones, v.num_puertas, v.num_plazas, v.traccion, 
        v.caja_cambios, v.precio_original,
        m.id_marca, m.nombre AS marca,
        mo.id_modelo, mo.nombre AS modelo,
        g.id_generacion, g.nombre AS generacion,
        mt.id_motorizacion, mt.nombre AS motorizacion, 
        mt.combustible, mt.potencia, mt.par_motor
        FROM Vehiculo v
        JOIN Motorizacion mt ON v.id_motorizacion = mt.id_motorizacion
        JOIN Generacion g ON mt.id_generacion = g.id_generacion
        JOIN Modelo mo ON g.id_modelo = mo.id_modelo
        JOIN Marca m ON mo.id_marca = m.id_marca
        WHERE v.id_vehiculo IN (?) 
        ORDER BY FIELD(v.id_vehiculo, ${limitedIds.join(',')})`;

    const imageSql = `SELECT id_vehiculo, ruta_local, descripcion, orden 
        FROM Imagenes 
        WHERE id_vehiculo IN (?) 
        ORDER BY id_vehiculo, orden ASC`;

    try {
        const [[vehicles], [images]] = await Promise.all([
            pool.query(sql, [limitedIds]),
            pool.query(imageSql, [limitedIds])
        ]);

        if (vehicles.length < 1) {
            return res.status(404).json({ message: 'Ninguno de los vehículos solicitados fue encontrado.' });
        }

        const imagesByVehicle = images.reduce((acc, img) => {
=======
    // 2. Limitar el número de vehículos a comparar (ej. máximo 4)
    const MAX_COMPARE = 4;
    const limitedIds = vehicleIds.slice(0, MAX_COMPARE);

    // 3. Preparar query para obtener todos los datos de los vehículos seleccionados
    // Usar IN (?) es seguro contra SQL Injection con mysql2
    // Seleccionar todas las columnas necesarias para la tabla comparativa
    const sql = `SELECT * FROM Vehiculo WHERE id_vehiculo IN (?) ORDER BY FIELD(id_vehiculo, ${limitedIds.map(() => '?').join(',')})`;
    // ORDER BY FIELD mantiene el orden original de los IDs solicitados

    // 4. Query adicional para obtener imágenes (opcional pero útil)
    const imageSql = `SELECT id_vehiculo, url, descripcion, orden FROM Imagenes WHERE id_vehiculo IN (?) ORDER BY id_vehiculo, orden ASC`;

    try {
         // 5. Ejecutar queries (en paralelo)
        const [[vehicles], [images]] = await Promise.all([
             pool.query(sql, [limitedIds, ...limitedIds]), // Pasar IDs dos veces por el FIELD()
             pool.query(imageSql, [limitedIds])
        ]);


         // 6. Si no se encuentran suficientes vehículos válidos
         if (vehicles.length < 1) { // Podríamos requerir al menos 2 si es estrictamente para comparar
            return res.status(404).json({ message: 'Ninguno de los vehículos solicitados fue encontrado.' });
         }

         // 7. Agrupar imágenes por id_vehiculo para fácil acceso
         const imagesByVehicle = images.reduce((acc, img) => {
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
            if (!acc[img.id_vehiculo]) {
                acc[img.id_vehiculo] = [];
            }
            acc[img.id_vehiculo].push(img);
            return acc;
<<<<<<< HEAD
        }, {});

        const vehiclesWithData = vehicles.map(v => ({
            ...v,
            imagenes: imagesByVehicle[v.id_vehiculo] || []
        }));

=======
         }, {});

         // 8. Añadir las imágenes a cada objeto de vehículo
         const vehiclesWithData = vehicles.map(v => ({
            ...v,
            imagenes: imagesByVehicle[v.id_vehiculo] || [] // Añadir array vacío si no tiene imágenes
         }));

        // 9. Devolver los vehículos encontrados
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
        res.status(200).json({
            message: `Datos obtenidos para ${vehiclesWithData.length} vehículos.`,
            data: vehiclesWithData
        });

    } catch (error) {
        console.error("Error obteniendo vehículos para comparación:", error);
        next(error);
    }
<<<<<<< HEAD
};

exports.deleteVehicle = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const sql = 'DELETE FROM Vehiculo WHERE id_vehiculo = ?';

    try {
        const [result] = await pool.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado para eliminar.' });
        }

        res.status(200).json({ message: `Vehículo con ID ${id} eliminado correctamente.` });
    } catch (error) {
        console.error(`Error eliminando vehículo ID ${id}:`, error);
        next(error);
    }
};
=======
}; 
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
