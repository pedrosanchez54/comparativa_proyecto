// Ruta: ~/comparativa_proyecto/comparativa-backend/controllers/favoriteController.js

const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

/**
 * Añade un vehículo a la lista de favoritos del usuario autenticado.
 */
exports.addFavorite = async (req, res, next) => {
    // 1. Validar ID del vehículo en la URL
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { idVehiculo } = req.params;
    const id_usuario = req.user.id; // Obtenido del middleware de autenticación

    try {
         // 2. Opcional pero recomendado: Verificar si el vehículo realmente existe
         const [vehicleExists] = await pool.query('SELECT id_vehiculo FROM Vehiculo WHERE id_vehiculo = ? LIMIT 1', [idVehiculo]);
         if (vehicleExists.length === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado.' });
         }

        // 3. Intentar insertar en la tabla Favoritos
        const sql = 'INSERT INTO Favoritos (id_usuario, id_vehiculo) VALUES (?, ?)';
        await pool.query(sql, [id_usuario, idVehiculo]);

        // 4. Enviar respuesta exitosa
        res.status(201).json({ message: 'Vehículo añadido a favoritos.' }); // 201 Created

    } catch (error) {
        // Manejar error si ya es favorito (violación de UNIQUE KEY unique_favorito)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este vehículo ya está en tus favoritos.' }); // 409 Conflict
        }
        // Manejar error si el idVehiculo no existe (aunque ya lo chequeamos)
         if (error.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(404).json({ message: 'El vehículo especificado no existe.' });
         }
        console.error(`Error añadiendo vehículo ${idVehiculo} a favoritos de usuario ${id_usuario}:`, error);
        next(error);
    }
};

/**
 * Quita un vehículo de la lista de favoritos del usuario autenticado.
 */
exports.removeFavorite = async (req, res, next) => {
    // 1. Validar ID del vehículo en la URL
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { idVehiculo } = req.params;
    const id_usuario = req.user.id;

    // 2. Ejecutar DELETE en la tabla Favoritos
    const sql = 'DELETE FROM Favoritos WHERE id_usuario = ? AND id_vehiculo = ?';
    try {
        const [result] = await pool.query(sql, [id_usuario, idVehiculo]);

        // 3. Comprobar si se eliminó algo
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Vehículo quitado de favoritos.' });
        } else {
            // Si no se afectaron filas, el vehículo no estaba en favoritos
            res.status(404).json({ message: 'Este vehículo no estaba en tus favoritos.' });
        }
    } catch (error) {
        console.error(`Error quitando vehículo ${idVehiculo} de favoritos de usuario ${id_usuario}:`, error);
        next(error);
    }
};

/**
 * Obtiene la lista de vehículos favoritos del usuario autenticado.
 */
exports.getMyFavorites = async (req, res, next) => {
    const id_usuario = req.user.id;
    const sql = `
        SELECT
            v.id_vehiculo, v.anio, v.tipo, v.version, v.pegatina_ambiental, v.velocidad_max, v.aceleracion_0_100, v.consumo_mixto, v.emisiones, v.peso, v.precio_original, v.precio_actual_estimado,
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
        const [favorites] = await pool.query(sql, [id_usuario]);
        
        // Formatear las imágenes principales
        const formattedFavorites = favorites.map(fav => ({
            ...fav,
            imagen_principal: fav.imagen_principal ? `${process.env.IMAGE_BASE_URL}/api/images/vehicles/${fav.imagen_principal}` : null
        }));
        
        res.status(200).json({ message: 'Favoritos obtenidos.', data: formattedFavorites });
    } catch (error) {
        console.error(`Error obteniendo favoritos de usuario ${id_usuario}:`, error);
        next(error);
    }
};

/**
 * Comprueba si un vehículo específico está en la lista de favoritos del usuario actual.
 * Útil para el estado inicial del botón de favorito en el frontend.
 */
 exports.checkFavoriteStatus = async (req, res, next) => {
    // 1. Validar ID del vehículo
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { idVehiculo } = req.params;
    const id_usuario = req.user.id;

    // 2. Consultar si existe la relación en la tabla Favoritos
    // Usar COUNT(*) es eficiente para solo saber si existe (1) o no (0)
    const sql = 'SELECT COUNT(*) as count FROM Favoritos WHERE id_usuario = ? AND id_vehiculo = ? LIMIT 1';
    try {
        const [[result]] = await pool.query(sql, [id_usuario, idVehiculo]);
        const isFavorite = result.count > 0;
        res.status(200).json({ isFavorite: isFavorite });
    } catch (error) {
        console.error(`Error comprobando estado favorito vehículo ${idVehiculo} para usuario ${id_usuario}:`, error);
        // Devolver false en caso de error para evitar estado inconsistente en frontend
        res.status(500).json({ isFavorite: false, message: "Error al comprobar estado favorito." });
        // O pasar al error handler: next(error);
    }
};
