const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

/**
 * Añade un nuevo tiempo de circuito para un vehículo. Requiere rol de administrador.
 */
exports.addCircuitTime = async (req, res, next) => {
    // 1. Validar datos del body y ID de vehículo de la URL (validado en ruta)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { idVehiculo } = req.params;
    const { circuito, tiempo_vuelta, condiciones, fecha_record, piloto, neumaticos, fuente_url } = req.body;

    try {
        // 2. (Opcional) Verificar si el vehículo existe
         const [vehicleExists] = await pool.query('SELECT id_vehiculo FROM Vehiculo WHERE id_vehiculo = ? LIMIT 1', [idVehiculo]);
         if (vehicleExists.length === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado para añadir tiempo.' });
         }

        // 3. Insertar el tiempo en la BD
        const sql = `
            INSERT INTO Tiempos_Circuito
            (id_vehiculo, circuito, tiempo_vuelta, condiciones, fecha_record, piloto, neumaticos, fuente_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        // Usar || null para campos opcionales para asegurar que se guarda NULL si están vacíos/undefined
        const params = [
            idVehiculo, circuito, tiempo_vuelta,
            condiciones || null, fecha_record || null, piloto || null,
            neumaticos || null, fuente_url || null
        ];
        const [result] = await pool.query(sql, params);

        // 4. Enviar respuesta exitosa
        res.status(201).json({ message: 'Tiempo de circuito añadido correctamente.', timeId: result.insertId });

    } catch (error) {
        console.error(`Error añadiendo tiempo para vehículo ${idVehiculo}:`, error);
        next(error);
    }
};

/**
 * Obtiene todos los tiempos de circuito registrados para un vehículo específico.
 * Esta ruta es pública.
 */
exports.getVehicleTimes = async (req, res, next) => {
    // ID del vehículo viene validado desde la ruta
    const { idVehiculo } = req.params;

    // Query para obtener los tiempos ordenados
    const sql = `
        SELECT id_tiempo, circuito, tiempo_vuelta, condiciones, fecha_record, piloto, neumaticos, fuente_url
        FROM Tiempos_Circuito
        WHERE id_vehiculo = ?
        ORDER BY circuito ASC, tiempo_vuelta ASC`;

    try {
        const [times] = await pool.query(sql, [idVehiculo]);
        res.status(200).json({ message: `Tiempos obtenidos para vehículo ${idVehiculo}.`, data: times });
    } catch (error) {
        console.error(`Error obteniendo tiempos para vehículo ${idVehiculo}:`, error);
        next(error);
    }
};

/**
 * Elimina un tiempo de circuito específico por su ID. Requiere rol de administrador.
 */
exports.deleteCircuitTime = async (req, res, next) => {
    // 1. Validar ID del tiempo en la URL
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { idTiempo } = req.params;

    // 2. Ejecutar DELETE
    const sql = 'DELETE FROM Tiempos_Circuito WHERE id_tiempo = ?';
    try {
        const [result] = await pool.query(sql, [idTiempo]);

        // 3. Comprobar si se eliminó
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Tiempo de circuito eliminado correctamente.' });
        } else {
            res.status(404).json({ message: 'Tiempo de circuito no encontrado.' });
        }
    } catch (error) {
        console.error(`Error eliminando tiempo ${idTiempo}:`, error);
        next(error);
    }
}; 