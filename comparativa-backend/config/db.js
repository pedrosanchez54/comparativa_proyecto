// Ruta: ~/comparativa_proyecto/comparativa-backend/config/db.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// Creamos un "pool" de conexiones. Es más eficiente que crear/cerrar conexiones individuales.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'comparativa_user',
  password: process.env.DB_PASSWORD, // Lee la contraseña desde .env
  database: process.env.DB_DATABASE || 'comparativa_vehiculos',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true, // Esperar si todas las conexiones del pool están ocupadas
  connectionLimit: 15,     // Número máximo de conexiones simultáneas
  queueLimit: 0,           // Sin límite de queries en cola (esperan conexión libre)
  connectTimeout: 10000    // Tiempo máximo para establecer conexión (10s)
});

// Función para probar la conexión al iniciar
async function testDbConnection() {
  let connection;
  try {
    // Intenta obtener una conexión del pool
    connection = await pool.getConnection();
    console.log(`✅ MySQL Conectado: ${connection.config.host}/${connection.config.database}`);
    return true; // Indica éxito
  } catch (error) {
    // Muestra un error claro si la conexión falla
    console.error(`❌ Error al conectar con la base de datos: ${error.message}`);
    return false; // Indica fallo
  } finally {
    // IMPORTANTE: Siempre liberar la conexión de vuelta al pool
    if (connection) connection.release();
  }
}

// Exportar el pool y la función de prueba
module.exports = {
  pool,
  testDbConnection
};
