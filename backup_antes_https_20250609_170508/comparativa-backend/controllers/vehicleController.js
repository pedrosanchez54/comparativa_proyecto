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
        tipo, combustible, pegatina_ambiental, traccion, caja_cambios, num_puertas, num_plazas,
        anioMin, anioMax, potMin, potMax, precioMin, precioMax, pesoMin, pesoMax,
        searchText, version, anio
    } = queryParams;

    // Búsqueda por texto (marca, modelo, versión)
    if (searchText) {
        whereClause += ` AND (
            m.nombre LIKE ? OR 
            mo.nombre LIKE ? OR 
            v.version LIKE ? OR
            CONCAT(m.nombre, ' ', mo.nombre, ' ', COALESCE(v.version, '')) LIKE ?
        )`;
        const searchPattern = `%${searchText}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Filtros por ID (relaciones)
    if (id_marca)        { whereClause += ' AND m.id_marca = ?'; params.push(id_marca); }
    if (id_modelo)       { whereClause += ' AND mo.id_modelo = ?'; params.push(id_modelo); }
    if (id_generacion)   { whereClause += ' AND g.id_generacion = ?'; params.push(id_generacion); }
    if (id_motorizacion) { whereClause += ' AND v.id_motorizacion = ?'; params.push(id_motorizacion); }
    
    // Filtros por campos categóricos
    if (tipo)            { whereClause += ' AND v.tipo = ?'; params.push(tipo); }
    if (combustible)     { whereClause += ' AND mt.combustible = ?'; params.push(combustible); }
    if (pegatina_ambiental) { whereClause += ' AND v.pegatina_ambiental = ?'; params.push(pegatina_ambiental); }
    if (traccion)        { whereClause += ' AND v.traccion = ?'; params.push(traccion); }
    if (caja_cambios)    { whereClause += ' AND v.caja_cambios = ?'; params.push(caja_cambios); }
    if (num_puertas)     { whereClause += ' AND v.num_puertas = ?'; params.push(num_puertas); }
    if (num_plazas)      { whereClause += ' AND v.num_plazas = ?'; params.push(num_plazas); }
    if (version)         { whereClause += ' AND v.version = ?'; params.push(version); }
    
    // Filtros por año
    if (anio)            { whereClause += ' AND v.anio = ?'; params.push(anio); }
    if (anioMin)         { whereClause += ' AND v.anio >= ?'; params.push(anioMin); }
    if (anioMax)         { whereClause += ' AND v.anio <= ?'; params.push(anioMax); }
    
    // Filtros por potencia (con manejo de NULL)
    if (potMin)          { 
        whereClause += ' AND mt.potencia IS NOT NULL AND mt.potencia >= ?'; 
        params.push(potMin); 
    }
    if (potMax)          { 
        whereClause += ' AND mt.potencia IS NOT NULL AND mt.potencia <= ?'; 
        params.push(potMax); 
    }
    
    // Filtros por precio (con manejo de NULL)
    if (precioMin)       { 
        whereClause += ' AND v.precio_original IS NOT NULL AND v.precio_original >= ?'; 
        params.push(precioMin); 
    }
    if (precioMax)       { 
        whereClause += ' AND v.precio_original IS NOT NULL AND v.precio_original <= ?'; 
        params.push(precioMax); 
    }
    
    // Filtros por peso (con manejo de NULL)
    if (pesoMin)         { 
        whereClause += ' AND v.peso IS NOT NULL AND v.peso >= ?'; 
        params.push(pesoMin); 
    }
    if (pesoMax)         { 
        whereClause += ' AND v.peso IS NOT NULL AND v.peso <= ?'; 
        params.push(pesoMax); 
    }
    
    return { whereClause, params };
}

/**
 * Crea un nuevo vehículo. Requiere rol de administrador.
 */
exports.createVehicle = async (req, res, next) => {
    // 1. Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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
    }
};

/**
 * Obtiene una lista de vehículos con filtros, paginación y ordenación.
 */
exports.getVehicles = async (req, res, next) => {
    const { page = 1, limit = 10, sortBy = 'm.nombre', sortOrder = 'ASC' } = req.query;
    const offset = (page - 1) * limit;
    const { whereClause, params } = buildWhereClause(req.query);
    
    // Campos permitidos para ordenar (deben coincidir con los del frontend)
    const allowedSortBy = [
        'm.nombre', 'mo.nombre', 'g.nombre', 'mt.nombre', 
        'v.anio', 'mt.potencia', 'v.precio_original', 'v.precio_actual_estimado',
        'v.peso', 'v.aceleracion_0_100', 'v.velocidad_max', 'v.emisiones',
        'v.fecha_creacion', 'v.fecha_actualizacion'
    ];
    
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'm.nombre';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Query con JOINs para devolver datos anidados
    const countSql = `SELECT COUNT(*) as total FROM Vehiculo v
        JOIN Motorizacion mt ON v.id_motorizacion = mt.id_motorizacion
        JOIN Generacion g ON mt.id_generacion = g.id_generacion
        JOIN Modelo mo ON g.id_modelo = mo.id_modelo
        JOIN Marca m ON mo.id_marca = m.id_marca
        ${whereClause}`;

    const dataSql = `SELECT DISTINCT
        v.id_vehiculo, v.anio, v.version, v.tipo, v.pegatina_ambiental, 
        v.velocidad_max, v.aceleracion_0_100, v.distancia_frenado_100_0,
        v.consumo_urbano, v.consumo_extraurbano, v.consumo_mixto, 
        v.emisiones, v.autonomia_electrica, v.capacidad_bateria,
        v.tiempo_carga_ac, v.potencia_carga_dc, v.tiempo_carga_dc_10_80,
        v.peso, v.num_puertas, v.num_plazas, v.vol_maletero, v.vol_maletero_max,
        v.dimension_largo, v.dimension_ancho, v.dimension_alto, v.distancia_entre_ejes,
        v.traccion, v.caja_cambios, v.num_marchas, v.precio_original, v.precio_actual_estimado,
        v.fecha_lanzamiento, v.fecha_creacion, v.fecha_actualizacion,
        mt.id_motorizacion, mt.nombre as motorizacion_nombre, mt.codigo_motor,
        mt.combustible, mt.potencia, mt.par_motor, mt.cilindrada, mt.num_cilindros, mt.arquitectura,
        g.id_generacion, g.nombre as generacion_nombre, g.anio_inicio, g.anio_fin,
        mo.id_modelo, mo.nombre as modelo_nombre,
        m.id_marca, m.nombre as marca_nombre,
        (SELECT ruta_local FROM Imagenes WHERE id_vehiculo = v.id_vehiculo ORDER BY orden LIMIT 1) as imagen_principal
        FROM Vehiculo v
        JOIN Motorizacion mt ON v.id_motorizacion = mt.id_motorizacion
        JOIN Generacion g ON mt.id_generacion = g.id_generacion
        JOIN Modelo mo ON g.id_modelo = mo.id_modelo
        JOIN Marca m ON mo.id_marca = m.id_marca
        ${whereClause}
        ORDER BY ${safeSortBy} ${safeSortOrder}
        LIMIT ? OFFSET ?`;

    try {
        const [countResult] = await pool.query(countSql, params);
        const [vehicles] = await pool.query(dataSql, [...params, parseInt(limit), parseInt(offset)]);

        // Formatear los datos para el frontend
        const formattedVehicles = vehicles.map(v => ({
            id_vehiculo: v.id_vehiculo,
            marca: v.marca_nombre,
            modelo: v.modelo_nombre,
            generacion: v.generacion_nombre,
            motorizacion: v.motorizacion_nombre,
            version: v.version,
            anio: v.anio,
            tipo: v.tipo,
            combustible: v.combustible,
            pegatina_ambiental: v.pegatina_ambiental,
            potencia: v.potencia ? parseFloat(v.potencia) : null,
            par_motor: v.par_motor ? parseFloat(v.par_motor) : null,
            velocidad_max: v.velocidad_max ? parseFloat(v.velocidad_max) : null,
            aceleracion_0_100: v.aceleracion_0_100 ? parseFloat(v.aceleracion_0_100) : null,
            distancia_frenado_100_0: v.distancia_frenado_100_0 ? parseFloat(v.distancia_frenado_100_0) : null,
            consumo_urbano: v.consumo_urbano ? parseFloat(v.consumo_urbano) : null,
            consumo_extraurbano: v.consumo_extraurbano ? parseFloat(v.consumo_extraurbano) : null,
            consumo_mixto: v.consumo_mixto ? parseFloat(v.consumo_mixto) : null,
            emisiones: v.emisiones ? parseInt(v.emisiones) : null,
            autonomia_electrica: v.autonomia_electrica ? parseFloat(v.autonomia_electrica) : null,
            capacidad_bateria: v.capacidad_bateria ? parseFloat(v.capacidad_bateria) : null,
            tiempo_carga_ac: v.tiempo_carga_ac ? parseFloat(v.tiempo_carga_ac) : null,
            potencia_carga_dc: v.potencia_carga_dc ? parseFloat(v.potencia_carga_dc) : null,
            tiempo_carga_dc_10_80: v.tiempo_carga_dc_10_80 ? parseFloat(v.tiempo_carga_dc_10_80) : null,
            peso: v.peso ? parseFloat(v.peso) : null,
            num_puertas: v.num_puertas,
            num_plazas: v.num_plazas,
            vol_maletero: v.vol_maletero ? parseFloat(v.vol_maletero) : null,
            vol_maletero_max: v.vol_maletero_max ? parseFloat(v.vol_maletero_max) : null,
            dimension_largo: v.dimension_largo ? parseFloat(v.dimension_largo) : null,
            dimension_ancho: v.dimension_ancho ? parseFloat(v.dimension_ancho) : null,
            dimension_alto: v.dimension_alto ? parseFloat(v.dimension_alto) : null,
            distancia_entre_ejes: v.distancia_entre_ejes ? parseFloat(v.distancia_entre_ejes) : null,
            traccion: v.traccion,
            caja_cambios: v.caja_cambios,
            num_marchas: v.num_marchas,
            precio_original: v.precio_original ? parseFloat(v.precio_original) : null,
            precio_actual_estimado: v.precio_actual_estimado ? parseFloat(v.precio_actual_estimado) : null,
            fecha_lanzamiento: v.fecha_lanzamiento,
            imagen_principal: v.imagen_principal ? `https://proyectocomparativa.ddns.net/api/images/vehicles/${v.imagen_principal}` : null,
            fecha_creacion: v.fecha_creacion,
            fecha_actualizacion: v.fecha_actualizacion
        }));

        // Calcular información de paginación
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        // Estructurar la respuesta
        res.json({
            success: true,
            data: {
                vehicles: formattedVehicles,
                currentPage: parseInt(page),
                totalPages,
                totalItems,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Error obteniendo vehículos:", error);
        next(error);
    }
};

/**
 * Obtiene un vehículo específico por su ID.
 */
exports.getVehicleById = async (req, res, next) => {
    const { id } = req.params;

    const sql = `SELECT 
        v.*, 
        mt.nombre as motorizacion_nombre, mt.codigo_motor,
        mt.combustible, mt.potencia, mt.par_motor,
        g.nombre as generacion_nombre, g.anio_inicio, g.anio_fin,
        mo.nombre as modelo_nombre,
        m.nombre as marca_nombre,
        (SELECT ruta_local FROM Imagenes WHERE id_vehiculo = v.id_vehiculo ORDER BY orden LIMIT 1) as imagen_principal
        FROM Vehiculo v
        JOIN Motorizacion mt ON v.id_motorizacion = mt.id_motorizacion
        JOIN Generacion g ON mt.id_generacion = g.id_generacion
        JOIN Modelo mo ON g.id_modelo = mo.id_modelo
        JOIN Marca m ON mo.id_marca = m.id_marca
    WHERE v.id_vehiculo = ?`;

    try {
        const [vehicles] = await pool.query(sql, [id]);
        if (vehicles.length === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado.' });
        }
        
        // Obtener datos del vehículo
        const vehicle = vehicles[0];
        
        // Formatear la imagen principal
        vehicle.imagen_principal = vehicle.imagen_principal ? `https://proyectocomparativa.ddns.net/api/images/vehicles/${vehicle.imagen_principal}` : null;
        
        // Obtener todas las imágenes del vehículo
        const [images] = await pool.query(
            'SELECT id_imagen, ruta_local, descripcion, orden FROM Imagenes WHERE id_vehiculo = ? ORDER BY orden',
            [id]
        );
        
        // Formatear URLs completas de las imágenes
        vehicle.imagenes = images.map(img => ({
            ...img,
            ruta_local: `https://proyectocomparativa.ddns.net/api/images/vehicles/${img.ruta_local}`
        }));
        
        // Obtener tiempos de circuito del vehículo
        const [times] = await pool.query(
            'SELECT id_tiempo, circuito, tiempo_vuelta, condiciones, fecha_record, piloto, neumaticos, fuente_url FROM Tiempos_Circuito WHERE id_vehiculo = ? ORDER BY circuito ASC, tiempo_vuelta ASC',
            [id]
        );
        
        vehicle.tiempos_circuito = times;
        
        res.json({ 
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.error("Error obteniendo vehículo:", error);
        next(error);
    }
};

/**
 * Actualiza un vehículo existente. Requiere rol de administrador.
 */
exports.updateVehicle = async (req, res, next) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Construir objeto con los datos permitidos
     const vehicleData = {};
    const allowedFields = [
        'anio', 'version', 'tipo', 'pegatina_ambiental',
        'velocidad_max', 'aceleracion_0_100', 'distancia_frenado_100_0',
        'consumo_urbano', 'consumo_extraurbano', 'consumo_mixto',
        'emisiones', 'autonomia_electrica', 'capacidad_bateria',
        'tiempo_carga_ac', 'potencia_carga_dc', 'tiempo_carga_dc_10_80',
        'peso', 'num_puertas', 'num_plazas', 'vol_maletero', 'vol_maletero_max',
        'dimension_largo', 'dimension_ancho', 'dimension_alto', 'distancia_entre_ejes',
        'traccion', 'caja_cambios', 'num_marchas',
        'precio_original', 'precio_actual_estimado', 'fecha_lanzamiento'
    ];

     for (const field of allowedFields) {
         if (req.body[field] !== undefined) {
             vehicleData[field] = req.body[field] === '' ? null : req.body[field];
         }
     }

     if (Object.keys(vehicleData).length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron datos válidos para actualizar.' });
     }

    const sql = 'UPDATE Vehiculo SET ? WHERE id_vehiculo = ?';

    try {
        const [result] = await pool.query(sql, [vehicleData, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado.' });
        }
        res.json({ message: 'Vehículo actualizado correctamente.' });
    } catch (error) {
         if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Error: Posible vehículo duplicado detectado.' });
         }
        console.error("Error actualizando vehículo:", error);
        next(error);
    }
};

/**
 * Elimina un vehículo. Requiere rol de administrador.
 */
exports.deleteVehicle = async (req, res, next) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM Vehiculo WHERE id_vehiculo = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado.' });
        }
        res.json({ message: 'Vehículo eliminado correctamente.' });
    } catch (error) {
        console.error("Error eliminando vehículo:", error);
        next(error);
    }
};

/**
 * Obtiene las opciones disponibles para los filtros (marcas, tipos, etc.).
 */
exports.getFilterOptions = async (req, res, next) => {
    try {
        // Obtener marcas
        const [marcas] = await pool.query('SELECT id_marca, nombre FROM Marca ORDER BY nombre');
        
        // Obtener modelos
        const [modelos] = await pool.query('SELECT id_modelo, id_marca, nombre FROM Modelo ORDER BY nombre');
        
        // Obtener generaciones
        const [generaciones] = await pool.query('SELECT id_generacion, id_modelo, nombre, anio_inicio, anio_fin FROM Generacion ORDER BY anio_inicio DESC');
        
        // Obtener motorizaciones
        const [motorizaciones] = await pool.query('SELECT id_motorizacion, id_generacion, nombre, codigo_motor FROM Motorizacion ORDER BY nombre');
        
        // Obtener valores únicos para otros filtros
        const [tipos] = await pool.query('SELECT DISTINCT tipo FROM Vehiculo WHERE tipo IS NOT NULL ORDER BY tipo');
        const [combustibles] = await pool.query('SELECT DISTINCT combustible FROM Motorizacion WHERE combustible IS NOT NULL ORDER BY combustible');
        const [pegatinas] = await pool.query('SELECT DISTINCT pegatina_ambiental FROM Vehiculo WHERE pegatina_ambiental IS NOT NULL ORDER BY pegatina_ambiental');
        const [tracciones] = await pool.query('SELECT DISTINCT traccion FROM Vehiculo WHERE traccion IS NOT NULL ORDER BY traccion');
        const [cajas] = await pool.query('SELECT DISTINCT caja_cambios FROM Vehiculo WHERE caja_cambios IS NOT NULL ORDER BY caja_cambios');
        
        res.json({
            marcas,
            modelos,
            generaciones,
            motorizaciones,
            tipos: tipos.map(t => t.tipo),
            combustibles: combustibles.map(c => c.combustible),
            pegatinas: pegatinas.map(p => p.pegatina_ambiental),
            tracciones: tracciones.map(t => t.traccion),
            cajas_cambios: cajas.map(c => c.caja_cambios)
        });
    } catch (error) {
        console.error("Error obteniendo opciones de filtros:", error);
        next(error);
    }
};

/**
 * Obtiene múltiples vehículos para comparación por sus IDs.
 * Query param: ?ids=1,2,3,4
 */
exports.getVehiclesForComparison = async (req, res, next) => {
    const { ids } = req.query;
    
    if (!ids) {
        return res.status(400).json({ message: 'Se requiere el parámetro "ids".' });
    }
    
    // Convertir string de IDs a array y validar
    const vehicleIds = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (vehicleIds.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron IDs válidos.' });
    }
    
    if (vehicleIds.length > 6) {
        return res.status(400).json({ message: 'Máximo 6 vehículos para comparar.' });
    }
    
    // Crear placeholders para la consulta SQL
    const placeholders = vehicleIds.map(() => '?').join(',');
    
    const sql = `SELECT 
        v.*, 
        mt.nombre as motorizacion_nombre, mt.codigo_motor,
        mt.combustible, mt.potencia, mt.par_motor, mt.cilindrada, 
        mt.num_cilindros, mt.arquitectura,
        g.nombre as generacion_nombre, g.anio_inicio, g.anio_fin,
        mo.nombre as modelo_nombre,
        m.nombre as marca_nombre,
        (SELECT ruta_local FROM Imagenes WHERE id_vehiculo = v.id_vehiculo ORDER BY orden LIMIT 1) as imagen_principal
        FROM Vehiculo v
        JOIN Motorizacion mt ON v.id_motorizacion = mt.id_motorizacion
        JOIN Generacion g ON mt.id_generacion = g.id_generacion
        JOIN Modelo mo ON g.id_modelo = mo.id_modelo
        JOIN Marca m ON mo.id_marca = m.id_marca
        WHERE v.id_vehiculo IN (${placeholders})
        ORDER BY FIELD(v.id_vehiculo, ${placeholders})`;
    
    try {
        const [vehicles] = await pool.query(sql, [...vehicleIds, ...vehicleIds]);
        
        if (vehicles.length < 2) {
            return res.status(404).json({ message: 'No se encontraron suficientes vehículos para comparar.' });
        }
        
        // Formatear los datos para facilitar el uso en el frontend
        const formattedVehicles = vehicles.map(v => ({
            id_vehiculo: v.id_vehiculo,
            marca: v.marca_nombre,
            modelo: v.modelo_nombre,
            generacion: v.generacion_nombre,
            motorizacion: v.motorizacion_nombre,
            version: v.version,
            anio: v.anio,
            tipo: v.tipo,
            
            // Motor y rendimiento
            combustible: v.combustible,
            potencia: v.potencia ? parseFloat(v.potencia) : null,
            par_motor: v.par_motor ? parseFloat(v.par_motor) : null,
            cilindrada: v.cilindrada ? parseFloat(v.cilindrada) : null,
            num_cilindros: v.num_cilindros,
            arquitectura: v.arquitectura,
            
            // Prestaciones
            velocidad_max: v.velocidad_max ? parseFloat(v.velocidad_max) : null,
            aceleracion_0_100: v.aceleracion_0_100 ? parseFloat(v.aceleracion_0_100) : null,
            distancia_frenado_100_0: v.distancia_frenado_100_0 ? parseFloat(v.distancia_frenado_100_0) : null,
            
            // Consumo y emisiones - CONVERTIR A NÚMEROS
            consumo_urbano: v.consumo_urbano ? parseFloat(v.consumo_urbano) : null,
            consumo_extraurbano: v.consumo_extraurbano ? parseFloat(v.consumo_extraurbano) : null,
            consumo_mixto: v.consumo_mixto ? parseFloat(v.consumo_mixto) : null,
            emisiones: v.emisiones ? parseInt(v.emisiones) : null,
            pegatina_ambiental: v.pegatina_ambiental,
            
            // Eléctrico
            autonomia_electrica: v.autonomia_electrica ? parseFloat(v.autonomia_electrica) : null,
            capacidad_bateria: v.capacidad_bateria ? parseFloat(v.capacidad_bateria) : null,
            tiempo_carga_ac: v.tiempo_carga_ac ? parseFloat(v.tiempo_carga_ac) : null,
            potencia_carga_dc: v.potencia_carga_dc ? parseFloat(v.potencia_carga_dc) : null,
            tiempo_carga_dc_10_80: v.tiempo_carga_dc_10_80 ? parseFloat(v.tiempo_carga_dc_10_80) : null,
            
            // Dimensiones y capacidades
            peso: v.peso ? parseFloat(v.peso) : null,
            num_puertas: v.num_puertas,
            num_plazas: v.num_plazas,
            vol_maletero: v.vol_maletero ? parseFloat(v.vol_maletero) : null,
            vol_maletero_max: v.vol_maletero_max ? parseFloat(v.vol_maletero_max) : null,
            dimension_largo: v.dimension_largo ? parseFloat(v.dimension_largo) : null,
            dimension_ancho: v.dimension_ancho ? parseFloat(v.dimension_ancho) : null,
            dimension_alto: v.dimension_alto ? parseFloat(v.dimension_alto) : null,
            distancia_entre_ejes: v.distancia_entre_ejes ? parseFloat(v.distancia_entre_ejes) : null,
            
            // Transmisión
            traccion: v.traccion,
            caja_cambios: v.caja_cambios,
            num_marchas: v.num_marchas,
            
            // Precios
            precio_original: v.precio_original ? parseFloat(v.precio_original) : null,
            precio_actual_estimado: v.precio_actual_estimado ? parseFloat(v.precio_actual_estimado) : null,
            
            // Imagen
            imagen_principal: v.imagen_principal ? `https://proyectocomparativa.ddns.net/api/images/vehicles/${v.imagen_principal}` : null,
            fecha_creacion: v.fecha_creacion,
            fecha_actualizacion: v.fecha_actualizacion
        }));
        
        res.json({ 
            success: true,
            data: formattedVehicles
        });
    } catch (error) {
        console.error("Error obteniendo vehículos para comparación:", error);
        next(error);
    }
};
