// Ruta: ~/comparativa_proyecto/comparativa-backend/controllers/listController.js

const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

/**
 * Crea una nueva lista para el usuario autenticado.
 */
exports.createList = async (req, res, next) => {
    // 1. Validar datos del body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // 2. Obtener datos y ID de usuario de la sesión
    const { nombre_lista, descripcion, es_publica } = req.body;
    const id_usuario = req.user.id; // Asume que isAuthenticated ya se ejecutó

    // 3. Insertar en la BD
    const sql = 'INSERT INTO Listas (id_usuario, nombre_lista, descripcion, es_publica) VALUES (?, ?, ?, ?)';
    try {
        // Usar ?? false para manejar el caso donde es_publica no se envíe
        const [result] = await pool.query(sql, [id_usuario, nombre_lista, descripcion || null, es_publica ?? false]);
        res.status(201).json({ message: 'Lista creada correctamente.', listId: result.insertId });
    } catch (error) {
         // Manejar error de nombre duplicado por usuario (si existe la constraint UNIQUE)
         if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya tienes una lista con ese nombre.' });
         }
        console.error("Error creando lista:", error);
        next(error);
    }
};

/**
 * Obtiene todas las listas creadas por el usuario autenticado.
 */
exports.getMyLists = async (req, res, next) => {
    const id_usuario = req.user.id;
    const sql = `
        SELECT
            l.id_lista, l.nombre_lista, l.descripcion, l.es_publica,
            l.fecha_creacion, l.fecha_actualizacion,
            COUNT(vl.id_vehiculo) as vehicle_count
        FROM Listas l
        LEFT JOIN Vehiculos_Listas vl ON l.id_lista = vl.id_lista
        WHERE l.id_usuario = ?
        GROUP BY l.id_lista
        ORDER BY l.fecha_actualizacion DESC`;
    try {
        const [lists] = await pool.query(sql, [id_usuario]);
        res.status(200).json({ message: 'Listas del usuario obtenidas.', data: lists });
    } catch (error) {
        console.error("Error obteniendo listas del usuario:", error);
        next(error);
    }
};

/**
 * Obtiene los detalles de una lista específica, incluyendo los vehículos que contiene.
 */
exports.getListDetails = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { idLista } = req.params;
    const id_usuario = req.user.id;
    const listSql = 'SELECT id_lista, id_usuario, nombre_lista, descripcion, es_publica, fecha_creacion, fecha_actualizacion FROM Listas WHERE id_lista = ? LIMIT 1';
    // JOINs para devolver datos anidados del vehículo
    const vehiclesSql = `
        SELECT
            v.id_vehiculo, v.anio, v.tipo, v.version, v.pegatina_ambiental, v.velocidad_max, v.aceleracion_0_100, v.consumo_mixto, v.emisiones, v.peso, v.precio_original, v.precio_actual_estimado,
            m.id_marca, m.nombre AS marca,
            mo.id_modelo, mo.nombre AS modelo,
            g.id_generacion, g.nombre AS generacion,
            mt.id_motorizacion, mt.codigo_motor, mt.nombre AS motorizacion, mt.combustible, mt.potencia, mt.par_motor, mt.cilindrada, mt.num_cilindros, mt.arquitectura,
            vl.fecha_agregado, vl.notas,
            (SELECT ruta_local FROM Imagenes img WHERE img.id_vehiculo = v.id_vehiculo ORDER BY img.orden ASC LIMIT 1) as imagen_principal
        FROM Vehiculos_Listas vl
        JOIN Vehiculo v ON vl.id_vehiculo = v.id_vehiculo
        JOIN Motorizacion mt ON v.id_motorizacion = mt.id_motorizacion
        JOIN Generacion g ON mt.id_generacion = g.id_generacion
        JOIN Modelo mo ON g.id_modelo = mo.id_modelo
        JOIN Marca m ON mo.id_marca = m.id_marca
        WHERE vl.id_lista = ?
        ORDER BY vl.fecha_agregado DESC`;
    try {
        const [listResult] = await pool.query(listSql, [idLista]);
        if (listResult.length === 0) {
            return res.status(404).json({ message: 'Lista no encontrada.' });
        }
        const list = listResult[0];
        if (list.id_usuario !== id_usuario && !list.es_publica) {
            return res.status(403).json({ message: 'No tienes permiso para ver esta lista.' });
        }
        const [vehicles] = await pool.query(vehiclesSql, [idLista]);
        
        // Formatear las imágenes principales de los vehículos
        const formattedVehicles = vehicles.map(vehicle => ({
            ...vehicle,
            imagen_principal: vehicle.imagen_principal ? `http://proyectocomparativa.ddns.net:4000/api/images/vehicles/${vehicle.imagen_principal}` : null
        }));
        
        const responseData = {
            ...list,
            vehiculos: formattedVehicles
        };
        res.status(200).json({ message: 'Detalles de la lista obtenidos.', data: responseData });
    } catch (error) {
        console.error(`Error obteniendo detalles de lista ID ${idLista}:`, error);
        next(error);
    }
};

/**
 * Actualiza los datos de una lista (nombre, descripción, visibilidad).
 */
exports.updateList = async (req, res, next) => {
    // 1. Validar ID y datos del body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { idLista } = req.params;
    const id_usuario = req.user.id;
    const { nombre_lista, descripcion, es_publica } = req.body;

    // 2. Construir objeto de actualización solo con los campos proporcionados
    const updateData = {};
    if (nombre_lista !== undefined) updateData.nombre_lista = nombre_lista.trim();
    if (descripcion !== undefined) updateData.descripcion = descripcion === '' ? null : descripcion.trim(); // Guardar NULL si está vacío
    if (es_publica !== undefined) updateData.es_publica = es_publica;

    // 3. Verificar que hay algo que actualizar
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
    }
    // Nota: fecha_actualizacion se actualiza automáticamente en la BD.

    // 4. Ejecutar UPDATE, asegurando que solo el dueño pueda modificar
    const sql = 'UPDATE Listas SET ? WHERE id_lista = ? AND id_usuario = ?';

    try {
        const [result] = await pool.query(sql, [updateData, idLista, id_usuario]);

        // 5. Comprobar si se afectó alguna fila
        if (result.affectedRows === 0) {
             // Si no afectó filas, puede ser porque la lista no existe o no pertenece al usuario
             const [listExists] = await pool.query('SELECT id_lista FROM Listas WHERE id_lista = ? LIMIT 1', [idLista]);
             if (listExists.length > 0) {
                 // La lista existe, pero no es del usuario
                 return res.status(403).json({ message: 'No tienes permiso para actualizar esta lista.' });
             } else {
                 // La lista no existe
                return res.status(404).json({ message: 'Lista no encontrada.' });
             }
        }
        // 6. Enviar respuesta exitosa
        res.status(200).json({ message: 'Lista actualizada correctamente.' });
    } catch (error) {
        // Manejar error de nombre duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya tienes otra lista con ese nombre.' });
         }
        console.error(`Error actualizando lista ID ${idLista}:`, error);
        next(error);
    }
};

/**
 * Elimina una lista creada por el usuario.
 */
exports.deleteList = async (req, res, next) => {
    // 1. Validar ID
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
     }
    const { idLista } = req.params;
    const id_usuario = req.user.id;

    // 2. Ejecutar DELETE, asegurando que solo el dueño pueda borrar
    const sql = 'DELETE FROM Listas WHERE id_lista = ? AND id_usuario = ?';

    try {
        const [result] = await pool.query(sql, [idLista, id_usuario]);

        // 3. Comprobar resultado
        if (result.affectedRows === 0) {
             // Verificar si existe pero no es del usuario, o si no existe
             const [listExists] = await pool.query('SELECT id_lista FROM Listas WHERE id_lista = ? LIMIT 1', [idLista]);
             if (listExists.length > 0) {
                 return res.status(403).json({ message: 'No tienes permiso para eliminar esta lista.' });
             } else {
                return res.status(404).json({ message: 'Lista no encontrada.' });
             }
        }
        // Nota: ON DELETE CASCADE en Vehiculos_Listas debería borrar las relaciones automáticamente.
        // 4. Enviar respuesta exitosa
        res.status(200).json({ message: 'Lista eliminada correctamente.' }); // o 204 No Content

    } catch (error) {
        console.error(`Error eliminando lista ID ${idLista}:`, error);
        next(error);
    }
};

/**
 * Añade un vehículo a una lista del usuario.
 */
exports.addVehicleToList = async (req, res, next) => {
    // 1. Validar IDs de URL
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { idLista, idVehiculo } = req.params;
    const id_usuario = req.user.id;
    const { notas } = req.body;

    // 2. Verificar que la lista pertenece al usuario
    const [list] = await pool.query('SELECT id_lista FROM Listas WHERE id_lista = ? AND id_usuario = ? LIMIT 1', [idLista, id_usuario]);
    if (list.length === 0) {
        return res.status(403).json({ message: 'No tienes permiso para modificar esta lista.' });
    }

    // 3. Insertar relación en Vehiculos_Listas
    const sql = 'INSERT INTO Vehiculos_Listas (id_lista, id_vehiculo, notas) VALUES (?, ?, ?)';
    try {
        await pool.query(sql, [idLista, idVehiculo, notas || null]);
        res.status(201).json({ message: 'Vehículo añadido a la lista.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este vehículo ya está en la lista.' });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ message: 'El vehículo especificado no existe.' });
        }
        console.error(`Error añadiendo vehículo ${idVehiculo} a lista ${idLista}:`, error);
        next(error);
    }
};

/**
 * Quita un vehículo de una lista del usuario.
 */
exports.removeVehicleFromList = async (req, res, next) => {
    // 1. Validar IDs de URL
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { idLista, idVehiculo } = req.params;
    const id_usuario = req.user.id;

    // 2. Verificar que la lista pertenece al usuario
    const [list] = await pool.query('SELECT id_lista FROM Listas WHERE id_lista = ? AND id_usuario = ? LIMIT 1', [idLista, id_usuario]);
    if (list.length === 0) {
        return res.status(403).json({ message: 'No tienes permiso para modificar esta lista.' });
    }

    // 3. Eliminar relación en Vehiculos_Listas
    const sql = 'DELETE FROM Vehiculos_Listas WHERE id_lista = ? AND id_vehiculo = ?';
    try {
        const [result] = await pool.query(sql, [idLista, idVehiculo]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'El vehículo no estaba en la lista.' });
        }
        res.status(200).json({ message: 'Vehículo eliminado de la lista.' });
    } catch (error) {
        console.error(`Error quitando vehículo ${idVehiculo} de lista ${idLista}:`, error);
        next(error);
    }
};
