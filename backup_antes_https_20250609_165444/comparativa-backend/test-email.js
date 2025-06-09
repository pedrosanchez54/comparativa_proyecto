#!/usr/bin/env node

/**
 * Script de prueba para verificar la configuración del sistema de correo
 * Uso: node test-email.js [email_destino]
 */

require('dotenv').config();
const { 
  sendTestEmail, 
  sendPasswordResetEmail, 
  verifyMailConfiguration,
  sendWelcomeEmail 
} = require('./utils/mailerUtils');

const readline = require('readline');

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

async function main() {
  console.log('\n🚗 === PRUEBA DEL SISTEMA DE CORREO - COMPARATIVA VEHÍCULOS ===\n');
  
  // Mostrar configuración actual
  console.log('📋 Configuración actual:');
  console.log(`   MAIL_HOST: ${process.env.MAIL_HOST || 'No configurado'}`);
  console.log(`   MAIL_PORT: ${process.env.MAIL_PORT || 'No configurado'}`);
  console.log(`   MAIL_USER: ${process.env.MAIL_USER || 'No configurado'}`);
  console.log(`   MAIL_FROM: ${process.env.MAIL_FROM || 'No configurado'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'No configurado'}\n`);

  // Verificar configuración
  console.log('🔍 Verificando configuración del transportador...');
  const isConfigValid = await verifyMailConfiguration();
  
  if (!isConfigValid) {
    console.log('\n❌ La configuración no es válida. Revisa las variables de entorno.');
    console.log('\n💡 Opciones de configuración:');
    console.log('   1. Gmail SMTP: MAIL_HOST=smtp.gmail.com, MAIL_PORT=587');
    console.log('   2. Postfix Local: MAIL_HOST=localhost, MAIL_PORT=25');
    console.log('   3. Mailtrap: MAIL_HOST=smtp.mailtrap.io, MAIL_PORT=2525');
    process.exit(1);
  }

  // Obtener email de destino
  let testEmail = process.argv[2];
  if (!testEmail) {
    testEmail = await askQuestion('📧 Introduce el email de destino para las pruebas: ');
  }

  if (!testEmail || !testEmail.includes('@')) {
    console.log('❌ Email no válido');
    process.exit(1);
  }

  console.log(`\n🎯 Enviando emails de prueba a: ${testEmail}\n`);

  // Menú de opciones
  while (true) {
    console.log('\n📋 Selecciona una opción:');
    console.log('   1. Enviar email de prueba básico');
    console.log('   2. Enviar email de restablecimiento de contraseña');
    console.log('   3. Enviar email de bienvenida');
    console.log('   4. Verificar configuración nuevamente');
    console.log('   5. Cambiar email de destino');
    console.log('   0. Salir');

    const option = await askQuestion('\n👉 Opción: ');

    switch (option) {
      case '1':
        console.log('\n📤 Enviando email de prueba básico...');
        const testResult = await sendTestEmail(testEmail);
        if (testResult) {
          console.log('✅ Email de prueba enviado correctamente');
        } else {
          console.log('❌ Error al enviar email de prueba');
        }
        break;

      case '2':
        console.log('\n🔐 Enviando email de restablecimiento de contraseña...');
        const resetToken = 'test_token_' + Date.now();
        const resetResult = await sendPasswordResetEmail(testEmail, resetToken);
        if (resetResult) {
          console.log('✅ Email de restablecimiento enviado correctamente');
          console.log(`🔗 Token de prueba: ${resetToken}`);
        } else {
          console.log('❌ Error al enviar email de restablecimiento');
        }
        break;

      case '3':
        const userName = await askQuestion('👤 Nombre del usuario para el email de bienvenida: ');
        console.log('\n🎉 Enviando email de bienvenida...');
        const welcomeResult = await sendWelcomeEmail(testEmail, userName || 'Usuario');
        if (welcomeResult) {
          console.log('✅ Email de bienvenida enviado correctamente');
        } else {
          console.log('❌ Error al enviar email de bienvenida');
        }
        break;

      case '4':
        console.log('\n🔍 Verificando configuración...');
        await verifyMailConfiguration();
        break;

      case '5':
        testEmail = await askQuestion('📧 Nuevo email de destino: ');
        if (!testEmail || !testEmail.includes('@')) {
          console.log('❌ Email no válido');
        } else {
          console.log(`✅ Email actualizado a: ${testEmail}`);
        }
        break;

      case '0':
        console.log('\n👋 ¡Hasta luego!');
        rl.close();
        process.exit(0);
        break;

      default:
        console.log('❌ Opción no válida');
        break;
    }
  }
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

// Ejecutar script
main().catch((error) => {
  console.error('\n❌ Error en el script:', error.message);
  process.exit(1);
}); 