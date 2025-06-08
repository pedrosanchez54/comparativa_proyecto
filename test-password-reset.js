#!/usr/bin/env node

/**
 * Script para probar el flujo completo de recuperación de contraseña
 * Uso: node test-password-reset.js [email]
 */

const axios = require('axios');
const readline = require('readline');

const API_BASE_URL = 'http://localhost:4000/api';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function testPasswordReset() {
  console.log('\n🔐 === PRUEBA DE RECUPERACIÓN DE CONTRASEÑA ===\n');

  try {
    // 1. Obtener email del usuario
    let email = process.argv[2];
    if (!email) {
      email = await askQuestion('📧 Email del usuario: ');
    }

    if (!email || !email.includes('@')) {
      console.log('❌ Email no válido');
      process.exit(1);
    }

    console.log(`\n🎯 Probando recuperación para: ${email}\n`);

    // 2. Solicitar restablecimiento de contraseña
    console.log('📤 Paso 1: Solicitando restablecimiento de contraseña...');
    
    try {
      const resetResponse = await axios.post(`${API_BASE_URL}/auth/request-password-reset`, {
        email: email
      });
      
      console.log('✅ Solicitud enviada:', resetResponse.data.message);
    } catch (error) {
      console.log('❌ Error en solicitud:', error.response?.data?.message || error.message);
      return;
    }

    // 3. Simular obtención del token (en un caso real vendría del email)
    console.log('\n🔗 Paso 2: Simulando obtención del token...');
    console.log('💡 En un caso real, el usuario obtendría el token del email recibido');
    
    const token = await askQuestion('🔑 Introduce el token de recuperación (o "test" para usar uno de prueba): ');
    
    let actualToken = token;
    if (token === 'test') {
      // Generar un token de prueba insertándolo directamente en la BD
      console.log('🧪 Generando token de prueba...');
      
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'comparativa_user',
        password: 'Comp4r4t1v4_P4ssw0rd!',
        database: 'comparativa_vehiculos'
      });

      const testToken = 'test_token_' + Date.now();
      const expiration = new Date(Date.now() + 3600000); // 1 hora

      await connection.execute(
        'UPDATE Usuarios SET token_recuperacion = ?, expiracion_token = ? WHERE email = ?',
        [testToken, expiration, email]
      );

      await connection.end();
      actualToken = testToken;
      console.log(`✅ Token de prueba generado: ${actualToken}`);
    }

    // 4. Validar token
    console.log('\n🔍 Paso 3: Validando token...');
    
    try {
      const validateResponse = await axios.get(`${API_BASE_URL}/auth/validate-reset-token/${actualToken}`);
      console.log('✅ Token válido:', validateResponse.data.message);
    } catch (error) {
      console.log('❌ Token inválido:', error.response?.data?.message || error.message);
      return;
    }

    // 5. Restablecer contraseña
    console.log('\n🔐 Paso 4: Restableciendo contraseña...');
    
    const newPassword = await askQuestion('🔑 Nueva contraseña: ');
    
    if (!newPassword || newPassword.length < 8) {
      console.log('❌ La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const resetPasswordResponse = await axios.post(`${API_BASE_URL}/auth/reset-password/${actualToken}`, {
        nuevaContraseña: newPassword
      });
      
      console.log('✅ Contraseña restablecida:', resetPasswordResponse.data.message);
    } catch (error) {
      console.log('❌ Error al restablecer:', error.response?.data?.message || error.message);
      return;
    }

    // 6. Probar login con nueva contraseña
    console.log('\n🚪 Paso 5: Probando login con nueva contraseña...');
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email,
        contraseña: newPassword
      });
      
      console.log('✅ Login exitoso:', loginResponse.data.message);
      console.log('👤 Usuario:', loginResponse.data.user.nombre);
    } catch (error) {
      console.log('❌ Error en login:', error.response?.data?.message || error.message);
      return;
    }

    console.log('\n🎉 ¡Flujo de recuperación completado exitosamente!');

  } catch (error) {
    console.error('\n❌ Error general:', error.message);
  } finally {
    rl.close();
  }
}

// Función para probar el registro con email de bienvenida
async function testRegistration() {
  console.log('\n👤 === PRUEBA DE REGISTRO CON EMAIL DE BIENVENIDA ===\n');

  try {
    const nombre = await askQuestion('👤 Nombre: ');
    const email = await askQuestion('📧 Email: ');
    const contraseña = await askQuestion('🔑 Contraseña: ');

    console.log('\n📤 Registrando usuario...');

    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      nombre,
      email,
      contraseña
    });

    console.log('✅ Usuario registrado:', response.data.message);
    console.log('📧 Revisa tu email para el mensaje de bienvenida');

  } catch (error) {
    console.log('❌ Error en registro:', error.response?.data?.message || error.message);
  }
}

// Menú principal
async function main() {
  console.log('\n🚗 === PRUEBAS DEL SISTEMA DE AUTENTICACIÓN ===\n');
  
  console.log('📋 Opciones disponibles:');
  console.log('   1. Probar recuperación de contraseña');
  console.log('   2. Probar registro con email de bienvenida');
  console.log('   0. Salir');

  const option = await askQuestion('\n👉 Selecciona una opción: ');

  switch (option) {
    case '1':
      await testPasswordReset();
      break;
    case '2':
      await testRegistration();
      break;
    case '0':
      console.log('👋 ¡Hasta luego!');
      break;
    default:
      console.log('❌ Opción no válida');
      break;
  }

  rl.close();
}

// Manejo de errores
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Error no manejado:', error.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Proceso interrumpido por el usuario');
  rl.close();
  process.exit(0);
});

// Verificar si axios está disponible
try {
  require.resolve('axios');
} catch (e) {
  console.log('❌ axios no está instalado. Ejecuta: npm install axios');
  process.exit(1);
}

// Verificar si mysql2 está disponible
try {
  require.resolve('mysql2');
} catch (e) {
  console.log('❌ mysql2 no está instalado. Ejecuta: npm install mysql2');
  process.exit(1);
}

// Ejecutar
main().catch((error) => {
  console.error('\n❌ Error en el script:', error.message);
  process.exit(1);
}); 