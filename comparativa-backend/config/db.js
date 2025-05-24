// Ruta: ~/comparativa_proyecto/comparativa-backend/config/db.js

<<<<<<< HEAD
const mysql = require('mysql2');
require('dotenv').config(); // Carga las variables de .env

// Crear el pool de conexiones con soporte para promesas
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'comparativa_user',
  password: process.env.DB_PASSWORD || 'Comp4r4t1v4_P4ssw0rd!',
  database: process.env.DB_DATABASE || 'comparativa_vehiculos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise(); // Convertir el pool a versión promise

// Función para probar la conexión
const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
  }
};

// Exportar el pool y la función de prueba
module.exports = {
  pool,
  testDbConnection
};
=======
const mysql = require('mysql2/promise');
require('dotenv').config(); // Carga las variables de .env

// Creamos un "pool" de conexiones. Es más eficiente que crear/cerrar conexiones individuales.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Lee la contraseña desde .env
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true, // Esperar si todas las conexiones del pool están ocupadas
  connectionLimit: 15,     // Número máximo de conexiones simultáneas
  queueLimit: 0,           // Sin límite de queries en cola (esperan conexión libre)
  connectTimeout: 10000    // Tiempo máximo para establecer conexión (10s)
});

// Función para probar la conexión al iniciar (opcional pero útil)
async function testDbConnection() {
  let connection;
  try {
    // Intenta obtener una conexión del pool
    connection = await pool.getConnection();
    console.log(`MySQL Conectado: ${connection.config.host}/${connection.config.database}`);
    return true; // Indica éxito
  } catch (error) {
    // Muestra un error claro si la conexión falla
    console.error(`Error al conectar con la base de datos: ${error.message}`);
    // Podrías decidir salir de la aplicación si la BD es esencial al inicio:
    // process.exit(1);
    return false; // Indica fallo
  } finally {
    // IMPORTANTE: Siempre liberar la conexión de vuelta al pool, incluso si hubo error
    if (connection) connection.release();
  }
}

// Exportamos el pool (para usarlo en los controladores) y la función de test
module.exports = { pool, testDbConnection };
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
