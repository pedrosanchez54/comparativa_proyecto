const nodemailer = require('nodemailer');
require('dotenv').config();

// Configura el "transportador" de email usando las variables de .env
// Asegúrate de que las variables MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS estén en tu .env
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587', 10), // Usar 587 o 2525 (Mailtrap)
  // secure: process.env.MAIL_PORT === '465', // true para puerto 465, false para otros
  auth: {
    user: process.env.MAIL_USER, // Usuario de tu servicio SMTP (ej. Mailtrap user)
    pass: process.env.MAIL_PASS, // Contraseña de tu servicio SMTP (ej. Mailtrap password)
  },
  // Podrían necesitarse opciones adicionales para algunos proveedores (ej. Gmail con App Passwords)
  // tls: { rejectUnauthorized: false } // ¡Usar con precaución, solo si es necesario!
});

/**
 * Envía un email para restablecer la contraseña.
 * @param {string} toEmail - La dirección de email del destinatario.
 * @param {string} token - El token único de restablecimiento.
 * @returns {Promise<boolean>} True si el email se envió correctamente, false si hubo un error.
 */
async function sendPasswordResetEmail(toEmail, token) {
  // Construye la URL que irá en el email, apuntando al frontend
  // Asegúrate que FRONTEND_URL está definida en tu .env
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.MAIL_FROM, // Dirección "De" configurada en .env
    to: toEmail,
    subject: 'Restablecimiento de contraseña - Comparativa App',
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Restablecimiento de Contraseña</h2>
        <p>Has solicitado restablecer tu contraseña para tu cuenta en Comparativa App.</p>
        <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            Restablecer Contraseña
          </a>
        </p>
        <p>Si el botón no funciona, copia y pega la siguiente URL en tu navegador:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Este enlace es válido por 1 hora. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
        <hr>
        <p style="font-size: 0.9em; color: #666;">Comparativa App</p>
      </div>
    `,
    // Opcional: versión en texto plano
    text: `Hola,\n\nHas solicitado restablecer tu contraseña.\n\nVisita esta URL para continuar: ${resetUrl}\n\nEste enlace expira en 1 hora.\n\nSi no lo solicitaste, ignora este email.\n\nGracias,\nComparativa App`
  };

  try {
    // Envía el email usando el transportador configurado
    let info = await transporter.sendMail(mailOptions);
    console.log(`Email de recuperación enviado a ${toEmail}: ${info.messageId}`);
    // En desarrollo con Mailtrap, puedes ver el email en tu bandeja de Mailtrap.io
    return true;
  } catch (error) {
    console.error(`Error al enviar email de recuperación a ${toEmail}:`, error);
    return false; // Indica que hubo un fallo
  }
}

module.exports = { sendPasswordResetEmail }; 