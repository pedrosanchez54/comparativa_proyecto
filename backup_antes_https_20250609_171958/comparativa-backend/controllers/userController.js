const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

/**
 * Actualiza el perfil del usuario autenticado
 */
const updateProfile = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, email, currentPassword } = req.body;
    const userId = req.user.id; // Viene del middleware de autenticación

    try {
        // Verificar contraseña actual por seguridad
        if (!currentPassword) {
            return res.status(400).json({ message: 'La contraseña actual es requerida para confirmar los cambios.' });
        }

        // Obtener contraseña actual del usuario
        const [userData] = await pool.query(
            'SELECT contraseña FROM Usuarios WHERE id_usuario = ?',
            [userId]
        );

        if (userData.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Verificar contraseña actual
        const { verifyPassword } = require('../utils/hashUtils');
        const isValidPassword = await verifyPassword(userData[0].contraseña, currentPassword);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'La contraseña actual es incorrecta.' });
        }

        // Verificar si el email ya existe (si se está cambiando)
        if (email) {
            const [existingUser] = await pool.query(
                'SELECT id_usuario FROM Usuarios WHERE email = ? AND id_usuario != ? LIMIT 1',
                [email, userId]
            );
            if (existingUser.length > 0) {
                return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
            }
        }

        // Actualizar perfil
        const [result] = await pool.query(
            'UPDATE Usuarios SET nombre = ?, email = ? WHERE id_usuario = ?',
            [nombre, email, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Obtener datos actualizados
        const [updatedUser] = await pool.query(
            'SELECT id_usuario as id, nombre, email, rol FROM Usuarios WHERE id_usuario = ?',
            [userId]
        );

        res.status(200).json(updatedUser[0]);
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        next(error);
    }
};

/**
 * Cambia la contraseña del usuario autenticado
 */
const changePassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        // Obtener contraseña actual
        const [user] = await pool.query(
            'SELECT contraseña FROM Usuarios WHERE id_usuario = ?',
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Verificar contraseña actual
        const { verifyPassword, hashPassword } = require('../utils/hashUtils');
        const isValidPassword = await verifyPassword(user[0].contraseña, currentPassword);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'La contraseña actual es incorrecta.' });
        }

        // Hashear nueva contraseña
        const hashedNewPassword = await hashPassword(newPassword);

        // Actualizar contraseña
        await pool.query(
            'UPDATE Usuarios SET contraseña = ? WHERE id_usuario = ?',
            [hashedNewPassword, userId]
        );

        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        next(error);
    }
};

/**
 * Obtiene la lista de vehículos favoritos del usuario
 */
const getFavorites = async (req, res, next) => {
    const userId = req.user.id;
    
    const sql = `
        SELECT
            v.id_vehiculo, v.anio, v.tipo, v.version, v.pegatina_ambiental, v.velocidad_max, v.aceleracion_0_100, 
            v.consumo_mixto, v.emisiones, v.peso, v.precio_original, v.precio_actual_estimado,
            v.autonomia_electrica, v.capacidad_bateria, v.tiempo_carga_ac, v.potencia_carga_dc,
            m.id_marca, m.nombre AS marca,
            mo.id_modelo, mo.nombre AS modelo,
            g.id_generacion, g.nombre AS generacion,
            mt.id_motorizacion, mt.codigo_motor, mt.nombre AS motorizacion, mt.combustible, mt.potencia, mt.par_motor, mt.cilindrada, mt.num_cilindros, mt.arquitectura,
            f.fecha_agregado,
            (SELECT ruta_local FROM Imagenes img WHERE img.id_vehiculo = v.id_vehiculo ORDER BY img.orden ASC LIMIT 1) as imagen_principal
        FROM Favoritos f
        JOIN Vehiculo v ON f.id_vehiculo = v.id_vehiculo
        JOIN Motorizacion mt ON v.id_motorizacion = mt.id_motorizacion
        JOIN Generacion g ON mt.id_generacion = g.id_generacion
        JOIN Modelo mo ON g.id_modelo = mo.id_modelo
        JOIN Marca m ON mo.id_marca = m.id_marca
        WHERE f.id_usuario = ?
        ORDER BY f.fecha_agregado DESC`;
        
    try {
        const [favorites] = await pool.query(sql, [userId]);
        
        // Formatear las imágenes principales
        const formattedFavorites = favorites.map(fav => ({
            ...fav,
            imagen_principal: fav.imagen_principal ? `https://proyectocomparativa.ddns.net/api/images/vehicles/${fav.imagen_principal}` : null
        }));
        
        res.status(200).json({ message: 'Favoritos obtenidos.', data: formattedFavorites });
    } catch (error) {
        console.error(`Error obteniendo favoritos de usuario ${userId}:`, error);
        next(error);
    }
};

/**
 * Verifica si un vehículo específico está en favoritos del usuario
 */
const checkFavoriteStatus = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { vehicleId } = req.params;
    const userId = req.user.id;

    const sql = 'SELECT COUNT(*) as count FROM Favoritos WHERE id_usuario = ? AND id_vehiculo = ? LIMIT 1';
    
    try {
        const [[result]] = await pool.query(sql, [userId, vehicleId]);
        const isFavorite = result.count > 0;
        res.status(200).json({ isFavorite: isFavorite });
    } catch (error) {
        console.error(`Error comprobando estado favorito vehículo ${vehicleId} para usuario ${userId}:`, error);
        res.status(500).json({ isFavorite: false, message: "Error al comprobar estado favorito." });
    }
};

/**
 * Añade un vehículo a favoritos del usuario
 */
const addToFavorites = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { vehicleId } = req.body;
    const userId = req.user.id;

    try {
        // Verificar si el vehículo existe
        const [vehicleExists] = await pool.query('SELECT id_vehiculo FROM Vehiculo WHERE id_vehiculo = ? LIMIT 1', [vehicleId]);
        if (vehicleExists.length === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado.' });
        }

        // Intentar insertar en favoritos
        const sql = 'INSERT INTO Favoritos (id_usuario, id_vehiculo) VALUES (?, ?)';
        await pool.query(sql, [userId, vehicleId]);

        res.status(201).json({ message: 'Vehículo añadido a favoritos.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este vehículo ya está en tus favoritos.' });
        }
        console.error(`Error añadiendo vehículo ${vehicleId} a favoritos de usuario ${userId}:`, error);
        next(error);
    }
};

/**
 * Quita un vehículo de favoritos del usuario
 */
const removeFromFavorites = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { vehicleId } = req.params;
    const userId = req.user.id;

    const sql = 'DELETE FROM Favoritos WHERE id_usuario = ? AND id_vehiculo = ?';
    
    try {
        const [result] = await pool.query(sql, [userId, vehicleId]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Vehículo quitado de favoritos.' });
        } else {
            res.status(404).json({ message: 'Este vehículo no estaba en tus favoritos.' });
        }
    } catch (error) {
        console.error(`Error quitando vehículo ${vehicleId} de favoritos de usuario ${userId}:`, error);
        next(error);
    }
};

/**
 * Obtiene la lista de listas del usuario
 */
const getLists = async (req, res, next) => {
    const userId = req.user.id;
    
    const sql = `
        SELECT
            l.id_lista as id, l.nombre_lista as nombre, l.descripcion, l.es_publica,
            l.fecha_creacion, l.fecha_actualizacion,
            COUNT(vl.id_vehiculo) as vehicle_count
        FROM Listas l
        LEFT JOIN Vehiculos_Listas vl ON l.id_lista = vl.id_lista
        WHERE l.id_usuario = ?
        GROUP BY l.id_lista
        ORDER BY l.fecha_actualizacion DESC`;
        
    try {
        const [lists] = await pool.query(sql, [userId]);
        res.status(200).json({ message: 'Listas obtenidas.', data: lists });
    } catch (error) {
        console.error(`Error obteniendo listas de usuario ${userId}:`, error);
        next(error);
    }
};

/**
 * Crea una nueva lista para el usuario
 */
const createList = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, descripcion, es_publica } = req.body;
    const userId = req.user.id;

    try {
        const sql = 'INSERT INTO Listas (id_usuario, nombre_lista, descripcion, es_publica) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [userId, nombre, descripcion || null, es_publica ?? false]);
        
        const newList = {
            id: result.insertId,
            nombre,
            descripcion,
            es_publica: es_publica ?? false,
            vehicle_count: 0
        };
        
        res.status(201).json({ message: 'Lista creada correctamente.', data: newList });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya tienes una lista con ese nombre.' });
        }
        console.error(`Error creando lista para usuario ${userId}:`, error);
        next(error);
    }
};

/**
 * Actualiza una lista del usuario
 */
const updateList = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { listId } = req.params;
    const userId = req.user.id;
    const { nombre, descripcion, es_publica } = req.body;

    try {
        // Construir objeto de actualización solo con los campos proporcionados
        const updateData = {};
        if (nombre !== undefined) updateData.nombre_lista = nombre.trim();
        if (descripcion !== undefined) updateData.descripcion = descripcion === '' ? null : descripcion.trim();
        if (es_publica !== undefined) updateData.es_publica = es_publica;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
        }

        const sql = 'UPDATE Listas SET ? WHERE id_lista = ? AND id_usuario = ?';
        const [result] = await pool.query(sql, [updateData, listId, userId]);

        if (result.affectedRows === 0) {
            const [listExists] = await pool.query('SELECT id_lista FROM Listas WHERE id_lista = ? LIMIT 1', [listId]);
            if (listExists.length > 0) {
                return res.status(403).json({ message: 'No tienes permiso para actualizar esta lista.' });
            } else {
                return res.status(404).json({ message: 'Lista no encontrada.' });
            }
        }

        res.status(200).json({ message: 'Lista actualizada correctamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya tienes otra lista con ese nombre.' });
        }
        console.error(`Error actualizando lista ${listId} de usuario ${userId}:`, error);
        next(error);
    }
};

/**
 * Elimina una lista del usuario
 */
const deleteList = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { listId } = req.params;
    const userId = req.user.id;

    try {
        const sql = 'DELETE FROM Listas WHERE id_lista = ? AND id_usuario = ?';
        const [result] = await pool.query(sql, [listId, userId]);

        if (result.affectedRows === 0) {
            const [listExists] = await pool.query('SELECT id_lista FROM Listas WHERE id_lista = ? LIMIT 1', [listId]);
            if (listExists.length > 0) {
                return res.status(403).json({ message: 'No tienes permiso para eliminar esta lista.' });
            } else {
                return res.status(404).json({ message: 'Lista no encontrada.' });
            }
        }

        res.status(200).json({ message: 'Lista eliminada correctamente.' });
    } catch (error) {
        console.error(`Error eliminando lista ${listId} de usuario ${userId}:`, error);
        next(error);
    }
};

/**
 * Obtiene los detalles de una lista específica con sus vehículos
 */
const getListDetails = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { listId } = req.params;
    const userId = req.user.id;

    try {
        // Obtener información de la lista
        const listSql = 'SELECT id_lista as id, id_usuario, nombre_lista as nombre, descripcion, es_publica, fecha_creacion, fecha_actualizacion FROM Listas WHERE id_lista = ? LIMIT 1';
        const [listResult] = await pool.query(listSql, [listId]);

        if (listResult.length === 0) {
            return res.status(404).json({ message: 'Lista no encontrada.' });
        }

        const list = listResult[0];

        // Verificar permisos
        if (list.id_usuario !== userId && !list.es_publica) {
            return res.status(403).json({ message: 'No tienes permiso para ver esta lista.' });
        }

        // Obtener vehículos de la lista
        const vehiclesSql = `
            SELECT
                v.id_vehiculo, v.anio, v.tipo, v.version, v.pegatina_ambiental, v.velocidad_max, v.aceleracion_0_100, 
                v.consumo_mixto, v.emisiones, v.peso, v.precio_original, v.precio_actual_estimado,
                v.autonomia_electrica, v.capacidad_bateria, v.tiempo_carga_ac, v.potencia_carga_dc,
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

        const [vehicles] = await pool.query(vehiclesSql, [listId]);

        // Formatear las imágenes principales de los vehículos
        const formattedVehicles = vehicles.map(vehicle => ({
            ...vehicle,
            imagen_principal: vehicle.imagen_principal ? `https://proyectocomparativa.ddns.net/api/images/vehicles/${vehicle.imagen_principal}` : null
        }));

        const responseData = {
            ...list,
            vehiculos: formattedVehicles
        };

        res.status(200).json({ message: 'Detalles de la lista obtenidos.', data: responseData });
    } catch (error) {
        console.error(`Error obteniendo detalles de lista ${listId}:`, error);
        next(error);
    }
};

/**
 * Añade un vehículo a una lista del usuario
 */
const addVehicleToList = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { listId, vehicleId } = req.params;
    const userId = req.user.id;
    const notas = req.body?.notas || null;

    try {
        // Verificar que la lista pertenece al usuario
        const [list] = await pool.query('SELECT id_lista FROM Listas WHERE id_lista = ? AND id_usuario = ? LIMIT 1', [listId, userId]);
        if (list.length === 0) {
            return res.status(403).json({ message: 'No tienes permiso para modificar esta lista.' });
        }

        // Insertar relación en Vehiculos_Listas
        const sql = 'INSERT INTO Vehiculos_Listas (id_lista, id_vehiculo, notas) VALUES (?, ?, ?)';
        await pool.query(sql, [listId, vehicleId, notas]);
        res.status(201).json({ message: 'Vehículo añadido a la lista.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este vehículo ya está en la lista.' });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ message: 'El vehículo especificado no existe.' });
        }
        console.error(`Error añadiendo vehículo ${vehicleId} a lista ${listId} de usuario ${userId}:`, error);
        next(error);
    }
};

/**
 * Quita un vehículo de una lista del usuario
 */
const removeVehicleFromList = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { listId, vehicleId } = req.params;
    const userId = req.user.id;

    try {
        // Verificar que la lista pertenece al usuario
        const [list] = await pool.query('SELECT id_lista FROM Listas WHERE id_lista = ? AND id_usuario = ? LIMIT 1', [listId, userId]);
        if (list.length === 0) {
            return res.status(403).json({ message: 'No tienes permiso para modificar esta lista.' });
        }

        // Eliminar relación en Vehiculos_Listas
        const sql = 'DELETE FROM Vehiculos_Listas WHERE id_lista = ? AND id_vehiculo = ?';
        const [result] = await pool.query(sql, [listId, vehicleId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'El vehículo no estaba en la lista.' });
        }
        
        res.status(200).json({ message: 'Vehículo eliminado de la lista.' });
    } catch (error) {
        console.error(`Error quitando vehículo ${vehicleId} de lista ${listId} de usuario ${userId}:`, error);
        next(error);
    }
};

/**
 * Verifica en qué listas del usuario está un vehículo específico
 */
const getVehicleListStatus = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { vehicleId } = req.params;
    const userId = req.user.id;

    try {
        const sql = `
            SELECT l.id_lista as listId
            FROM Listas l
            JOIN Vehiculos_Listas vl ON l.id_lista = vl.id_lista
            WHERE l.id_usuario = ? AND vl.id_vehiculo = ?`;
        
        const [result] = await pool.query(sql, [userId, vehicleId]);
        const listIds = result.map(row => row.listId);
        
        res.status(200).json({ data: listIds });
    } catch (error) {
        console.error(`Error verificando estado de vehículo ${vehicleId} en listas de usuario ${userId}:`, error);
        next(error);
    }
};

module.exports = {
    updateProfile,
    changePassword,
    getFavorites,
    checkFavoriteStatus,
    addToFavorites,
    removeFromFavorites,
    getLists,
    createList,
    updateList,
    deleteList,
    getListDetails,
    addVehicleToList,
    removeVehicleFromList,
    getVehicleListStatus
}; 