// Ruta: ~/comparativa_proyecto/comparativa-backend/controllers/imageController.js

const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

/**
 * Añade una nueva URL de imagen para un vehículo. Requiere rol de administrador.
 */
exports.addImage = async (req, res, next) => {
    // 1. Validar datos del body y ID de vehículo de la URL
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { idVehiculo } = req.params;
    const { ruta_local, descripcion, orden } = req.body;

     try {
        // 2. (Opcional) Verificar si el vehículo existe
         const [vehicleExists] = await pool.query('SELECT id_vehiculo FROM Vehiculo WHERE id_vehiculo = ? LIMIT 1', [idVehiculo]);
         if (vehicleExists.length === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado para añadir imagen.' });
         }

         // 3. Insertar la imagen en la BD
         const sql = 'INSERT INTO Imagenes (id_vehiculo, ruta_local, descripcion, orden) VALUES (?, ?, ?, ?)';
         // Usar valores por defecto si no se proporcionan
         const params = [idVehiculo, ruta_local, descripcion || null, orden ?? 0];
         const [result] = await pool.query(sql, params);

         // 4. Enviar respuesta exitosa
         res.status(201).json({ message: 'Imagen añadida correctamente.', imageId: result.insertId });

     } catch (error) {
        // Manejar posible error de FK si idVehiculo no existe (aunque ya lo chequeamos)
         if (error.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(404).json({ message: 'El vehículo especificado no existe.' });
         }
        console.error(`Error añadiendo imagen para vehículo ${idVehiculo}:`, error);
        next(error);
     }
};

/**
 * Obtiene todas las imágenes asociadas a un vehículo específico. Ruta pública.
 */
 exports.getVehicleImages = async (req, res, next) => {
     // ID del vehículo validado en la ruta
     const { idVehiculo } = req.params;

     // Query para obtener imágenes ordenadas
     const sql = 'SELECT id_imagen, ruta_local, descripcion, orden FROM Imagenes WHERE id_vehiculo = ? ORDER BY orden ASC';
     try {
         const [images] = await pool.query(sql, [idVehiculo]);
         res.status(200).json({ message: `Imágenes obtenidas para vehículo ${idVehiculo}.`, data: images });
     } catch (error) {
         console.error(`Error obteniendo imágenes para vehículo ${idVehiculo}:`, error);
         next(error);
     }
 };


/**
 * Elimina una imagen específica por su ID. Requiere rol de administrador.
 */
exports.deleteImage = async (req, res, next) => {
    // 1. Validar ID de la imagen en la URL
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { idImagen } = req.params; // ¡Ojo! Es el ID de la imagen, no del vehículo

    // 2. Ejecutar DELETE
    const sql = 'DELETE FROM Imagenes WHERE id_imagen = ?';

    try {
        const [result] = await pool.query(sql, [idImagen]);

        // 3. Comprobar resultado
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Imagen eliminada correctamente.' });
        } else {
            res.status(404).json({ message: 'Imagen no encontrada.' });
        }
    } catch (error) {
        console.error(`Error eliminando imagen ${idImagen}:`, error);
        next(error);
    }
};
