const nodemailer = require('nodemailer');
require('dotenv').config();

// === CONFIGURACIÓN DE MÚLTIPLES TRANSPORTADORES ===

// Transportador principal (Gmail SMTP)
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para puerto 465, false para otros
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS, // Usar App Password de Gmail
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Transportador local (Postfix)
const createLocalTransporter = () => {
  return nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    secure: false,
    ignoreTLS: true,
    // No necesita autenticación para localhost
  });
};

// Transportador de desarrollo (Mailtrap)
const createMailtrapTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

// Función para obtener el transportador apropiado
const getTransporter = () => {
  const mailHost = process.env.MAIL_HOST;
  
  if (mailHost === 'smtp.gmail.com') {
    return createGmailTransporter();
  } else if (mailHost === 'localhost') {
    return createLocalTransporter();
  } else if (mailHost === 'smtp.mailtrap.io') {
    return createMailtrapTransporter();
  } else {
    // Configuración genérica
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: process.env.MAIL_PORT === '465',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
};

/**
 * Verifica la configuración del transportador de correo
 * @returns {Promise<boolean>} True si la configuración es válida
 */
async function verifyMailConfiguration() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ Configuración de correo verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en la configuración de correo:', error.message);
    return false;
  }
}

/**
 * Envía un email para restablecer la contraseña con sistema de respaldo
 * @param {string} toEmail - La dirección de email del destinatario.
 * @param {string} token - El token único de restablecimiento.
 * @returns {Promise<boolean>} True si el email se envió correctamente, false si hubo un error.
 */
async function sendPasswordResetEmail(toEmail, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  const mailOptions = {
    from: process.env.MAIL_FROM || 'noreply@comparativa-vehiculos.com',
    to: toEmail,
    subject: '🔐 Restablecimiento de contraseña - Comparativa Vehículos',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecimiento de Contraseña</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚗 Comparativa Vehículos</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #495057; margin-top: 0;">Restablecimiento de Contraseña</h2>
          
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña para tu cuenta en <strong>Comparativa Vehículos</strong>.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              🔐 Restablecer Contraseña
            </a>
          </div>
          
          <p>Si el botón no funciona, copia y pega la siguiente URL en tu navegador:</p>
          <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
            <a href="${resetUrl}" style="color: #495057;">${resetUrl}</a>
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Importante:</strong> Este enlace es válido por <strong>1 hora</strong>. 
              Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #6c757d; text-align: center; margin: 0;">
            Este correo fue enviado automáticamente desde <strong>Comparativa Vehículos</strong><br>
            Si tienes problemas, contacta con nuestro soporte.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
🚗 Comparativa Vehículos - Restablecimiento de Contraseña

Hola,

Has solicitado restablecer tu contraseña para tu cuenta en Comparativa Vehículos.

Para continuar, visita esta URL: ${resetUrl}

⚠️ IMPORTANTE: Este enlace expira en 1 hora.

Si no solicitaste este cambio, puedes ignorar este email de forma segura.

Gracias,
Equipo de Comparativa Vehículos
    `
  };

  // Intentar envío con transportador principal
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperación enviado a ${toEmail}: ${info.messageId}`);
    return true;
  } catch (primaryError) {
    console.warn(`⚠️ Error con transportador principal:`, primaryError.message);
    
    // Intentar con transportador local como respaldo
    try {
      const localTransporter = createLocalTransporter();
      const info = await localTransporter.sendMail({
        ...mailOptions,
        from: `noreply@${require('os').hostname()}` // Usar hostname local
      });
      console.log(`✅ Email enviado con transportador local a ${toEmail}: ${info.messageId}`);
      return true;
    } catch (backupError) {
      console.error(`❌ Error también con transportador de respaldo:`, backupError.message);
      return false;
    }
  }
}

/**
 * Envía un email de bienvenida a nuevos usuarios
 * @param {string} toEmail - Email del destinatario
 * @param {string} userName - Nombre del usuario
 * @returns {Promise<boolean>}
 */
async function sendWelcomeEmail(toEmail, userName) {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'noreply@comparativa-vehiculos.com',
    to: toEmail,
    subject: '🎉 ¡Bienvenido a Comparativa Vehículos!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1>🚗 ¡Bienvenido a Comparativa Vehículos!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hola ${userName},</h2>
          <p>¡Gracias por registrarte en nuestra plataforma de comparación de vehículos!</p>
          <p>Ahora puedes:</p>
          <ul>
            <li>🔍 Comparar diferentes modelos de vehículos</li>
            <li>⭐ Guardar tus favoritos</li>
            <li>📊 Ver análisis detallados</li>
            <li>💬 Dejar reseñas y comentarios</li>
          </ul>
          <p>¡Esperamos que disfrutes de la experiencia!</p>
        </div>
      </div>
    `,
    text: `¡Bienvenido a Comparativa Vehículos, ${userName}! Gracias por registrarte en nuestra plataforma.`
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenida enviado a ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error enviando email de bienvenida:`, error.message);
    return false;
  }
}

/**
 * Función de prueba para verificar el envío de correos
 * @param {string} testEmail - Email de prueba
 * @returns {Promise<boolean>}
 */
async function sendTestEmail(testEmail) {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'noreply@comparativa-vehiculos.com',
    to: testEmail,
    subject: '🧪 Email de Prueba - Comparativa Vehículos',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
        <h2>✅ ¡Configuración de correo funcionando!</h2>
        <p>Este es un email de prueba para verificar que el sistema de correo está configurado correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <p><strong>Transportador:</strong> ${process.env.MAIL_HOST}</p>
        <hr>
        <p style="font-size: 12px; color: #666;">Comparativa Vehículos - Sistema de Correo</p>
      </div>
    `,
    text: `Email de prueba enviado correctamente el ${new Date().toLocaleString('es-ES')}`
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de prueba enviado a ${testEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error enviando email de prueba:`, error.message);
    return false;
  }
}

module.exports = { 
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendTestEmail,
  verifyMailConfiguration
}; 