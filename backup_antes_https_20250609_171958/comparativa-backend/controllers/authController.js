// Ruta: ~/comparativa_proyecto/comparativa-backend/controllers/authController.js

const { pool } = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/hashUtils');
const { generateSecureToken } = require('../utils/tokenUtils');
const { generateToken, verifyToken } = require('../utils/jwtUtils');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/mailerUtils');
const { validationResult } = require('express-validator');

// --- Lógica de Throttling (Prevención de Fuerza Bruta) ---
// Implementación simple en memoria. Para producción robusta, usar Redis o similar.
const loginAttempts = {}; // Objeto para almacenar intentos: { email: { attempts: N, lockUntil: timestamp } }
const MAX_ATTEMPTS = 5; // Máximo intentos fallidos antes de bloquear
const LOCK_TIME = 15 * 60 * 1000; // 15 minutos en milisegundos

/**
 * Registra un nuevo usuario.
 */
exports.register = async (req, res, next) => {
  // 1. Validar datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, email, contraseña } = req.body;

  try {
    // 2. Verificar si el email ya existe
    const [existingUser] = await pool.query('SELECT id_usuario FROM Usuarios WHERE email = ? LIMIT 1', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado.' }); // 409 Conflict
    }

    // 3. Hashear la contraseña
    const hashedPassword = await hashPassword(contraseña);

    // 4. Insertar usuario en la BD (rol por defecto es 'user')
    const [result] = await pool.query(
      'INSERT INTO Usuarios (nombre, email, contraseña) VALUES (?, ?, ?)',
      [nombre, email, hashedPassword]
    );

    // 5. Enviar email de bienvenida (no bloquear si falla)
    try {
      await sendWelcomeEmail(email, nombre);
      console.log(`✅ Email de bienvenida enviado a ${email}`);
    } catch (emailError) {
      console.warn(`⚠️ No se pudo enviar email de bienvenida a ${email}:`, emailError.message);
      // No fallar el registro por esto
    }

    // 6. Enviar respuesta exitosa
    res.status(201).json({ 
      message: 'Usuario registrado correctamente. ¡Revisa tu email para más información!', 
      userId: result.insertId 
    }); // 201 Created

  } catch (error) {
    // Si hay un error (ej. BD caída), pasar al manejador de errores
    next(error);
  }
};

/**
 * Inicia sesión de un usuario.
 */
exports.login = async (req, res, next) => {
  // 1. Validar datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
  }

  const { email, contraseña } = req.body;

  // 2. Comprobar Throttling (Bloqueo por intentos fallidos)
  const now = Date.now();
  if (loginAttempts[email] && loginAttempts[email].lockUntil > now) {
    const remainingTime = Math.ceil((loginAttempts[email].lockUntil - now) / 60000);
    return res.status(429).json({ message: `Demasiados intentos fallidos. Inténtalo de nuevo en ${remainingTime} minutos.` }); // 429 Too Many Requests
  }

  try {
    // 3. Buscar usuario por email
    const [rows] = await pool.query(
        'SELECT id_usuario, nombre, email, contraseña, rol, intentos_login, bloqueado_hasta FROM Usuarios WHERE email = ? LIMIT 1',
        [email]
    );

    // 4. Si el usuario no existe
    if (rows.length === 0) {
       handleFailedLoginAttempt(email); // Registrar intento fallido (sin revelar si existe o no)
      return res.status(401).json({ message: 'Credenciales incorrectas.' }); // Mensaje genérico
    }

    const user = rows[0];

    // 5. Verificar si la cuenta está bloqueada desde la BD (más persistente)
     if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
        const remainingTime = Math.ceil((new Date(user.bloqueado_hasta) - new Date()) / 60000);
         // Actualizar bloqueo en memoria por si acaso
         loginAttempts[email] = { attempts: user.intentos_login, lockUntil: new Date(user.bloqueado_hasta).getTime() };
         return res.status(429).json({ message: `Cuenta bloqueada. Inténtalo de nuevo en ${remainingTime} minutos.` });
     }

    // 6. Verificar la contraseña
    const isValidPassword = await verifyPassword(user.contraseña, contraseña);

    if (!isValidPassword) {
        const attempts = await handleFailedLoginAttempt(email, user.id_usuario, user.intentos_login);
         if (attempts >= MAX_ATTEMPTS) {
             const lockUntilDate = new Date(Date.now() + LOCK_TIME);
             const remainingTime = Math.ceil((lockUntilDate.getTime() - Date.now()) / 60000);
              // Actualizar bloqueo en memoria
             loginAttempts[email] = { attempts: attempts, lockUntil: lockUntilDate.getTime() };
             return res.status(429).json({ message: `Cuenta bloqueada. Inténtalo de nuevo en ${remainingTime} minutos.` });
         } else {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
         }
    }

    // 7. Éxito: Resetear intentos y establecer sesión + generar JWT
     await resetLoginAttempts(email, user.id_usuario);

    // Guardar información esencial en la sesión (compatibilidad)
    req.session.userId = user.id_usuario;
    req.session.userName = user.nombre;
    req.session.userEmail = user.email;
    req.session.userRole = user.rol; // Guardar rol para usar en middleware isAdmin

    // Generar token JWT
    const token = generateToken(user);

    // Enviar respuesta exitosa con token y datos básicos del usuario
    res.status(200).json({
      message: 'Inicio de sesión correcto.',
      token: token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Cierra la sesión del usuario.
 */
exports.logout = (req, res, next) => {
  // Destruye la sesión en el servidor
  req.session.destroy(err => {
    if (err) {
      console.error("Error al destruir la sesión:", err);
      // Aunque falle, intentamos limpiar la cookie y responder
      // return next(new Error('No se pudo cerrar la sesión correctamente.')); // O manejar de otra forma
    }
    // Limpia la cookie de sesión del lado del cliente (importante)
    res.clearCookie(process.env.SESSION_COOKIE_NAME); // Usa el nombre de la cookie definido en .env
    res.status(200).json({ message: 'Sesión cerrada correctamente.' });
  });
};

/**
 * Solicita un restablecimiento de contraseña enviando un email con un token.
 */
exports.requestPasswordReset = async (req, res, next) => {
    // 1. Validar email de entrada
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
     }

    const { email } = req.body;

    try {
        // 2. Buscar usuario por email
        const [users] = await pool.query('SELECT id_usuario FROM Usuarios WHERE email = ? LIMIT 1', [email]);

        // 3. Si el email existe, generar token y guardar en BD
        if (users.length > 0) {
            const userId = users[0].id_usuario;
            const token = generateSecureToken(); // Generar token seguro
            const expiration = new Date(Date.now() + 3600000); // Expira en 1 hora

            await pool.query(
                'UPDATE Usuarios SET token_recuperacion = ?, expiracion_token = ? WHERE id_usuario = ?',
                [token, expiration, userId]
            );

            // 4. Enviar email (no bloquear si falla, pero loguear)
            const emailSent = await sendPasswordResetEmail(email, token);
             if (!emailSent) {
                console.warn(`Fallo al enviar email de recuperación a ${email}, pero se generó el token.`);
                // Aquí podrías tener lógica de reintento o notificación interna
             }
        }
        // 5. Enviar siempre respuesta genérica para no revelar si un email existe o no
        res.status(200).json({ message: 'Si tu correo electrónico está registrado, recibirás un enlace para restablecer la contraseña en breve.' });

    } catch (error) {
        next(error);
    }
};

/**
 * Valida un token de restablecimiento de contraseña.
 */
exports.validateResetToken = async (req, res, next) => {
    const { token } = req.params;

    try {
        // Buscar usuario con token válido y no expirado
        const [users] = await pool.query(
            'SELECT id_usuario FROM Usuarios WHERE token_recuperacion = ? AND expiracion_token > NOW() LIMIT 1',
            [token]
        );

        // Si no se encuentra o ha expirado
        if (users.length === 0) {
            return res.status(400).json({ message: 'El token de restablecimiento es inválido o ha expirado.' });
        }

        // Token válido
        res.status(200).json({ message: 'Token válido.' });

    } catch (error) {
        next(error);
    }
};

/**
 * Restablece la contraseña usando un token válido.
 */
exports.resetPassword = async (req, res, next) => {
    // 1. Validar nueva contraseña y token
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
     }
    const { token } = req.params; // Token viene de la URL
    const { nuevaContraseña } = req.body;

    try {
        // 2. Buscar usuario con token válido y no expirado
        const [users] = await pool.query(
            'SELECT id_usuario FROM Usuarios WHERE token_recuperacion = ? AND expiracion_token > NOW() LIMIT 1',
            [token]
        );

        // 3. Si no se encuentra o ha expirado
        if (users.length === 0) {
            return res.status(400).json({ message: 'El token de restablecimiento es inválido o ha expirado.' });
        }

        const userId = users[0].id_usuario;

        // 4. Hashear la nueva contraseña
        const hashedPassword = await hashPassword(nuevaContraseña);

        // 5. Actualizar contraseña en BD y limpiar token/expiración
        await pool.query(
            'UPDATE Usuarios SET contraseña = ?, token_recuperacion = NULL, expiracion_token = NULL WHERE id_usuario = ?',
            [hashedPassword, userId]
        );

        // 6. Enviar respuesta exitosa
        res.status(200).json({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });

    } catch (error) {
        next(error);
    }
};

/**
 * Comprueba el estado de la sesión actual y devuelve datos del usuario si está con sesión iniciada.
 */
const getSessionStatus = async (req, res) => {
  try {
    // Verificar si hay token JWT válido
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const payload = verifyToken(token);
        
        // Buscar datos del usuario en la BD
        const [users] = await pool.query(
          'SELECT id_usuario as id, nombre, email, rol FROM Usuarios WHERE id_usuario = ? LIMIT 1',
          [payload.id]
        );
        
        if (users.length > 0) {
          return res.json({
            isAuthenticated: true,
            user: {
              id: users[0].id,
              nombre: users[0].nombre,
              email: users[0].email,
              rol: users[0].rol
            }
          });
        }
      } catch {
        // Token inválido, continuar para verificar sesión
      }
    }
    
    // Verificar sesión
    if (req.session && req.session.userId) {
      // Usuario con sesión iniciada por sesión, devuelve sus datos
      return res.json({
        isAuthenticated: true,
        user: {
          id: req.session.userId,
          nombre: req.session.userName,
          email: req.session.userEmail,
          rol: req.session.userRole
        }
      });
    }
    
    // Usuario sin sesión iniciada
    res.json({ isAuthenticated: false, user: null });
    
  } catch (error) {
    console.error('Error verificando estado de sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};


// --- Funciones Helper para Throttling ---

/** Registra un intento fallido y actualiza BD si es necesario */
async function handleFailedLoginAttempt(email, userId = null, currentAttemptsInDb = 0) {
    const now = Date.now();
    if (!loginAttempts[email] || loginAttempts[email].lockUntil <= now) {
        // Si no hay registro, o el bloqueo expiró, empezar de 0 (o usar valor de BD si existe)
         loginAttempts[email] = { attempts: userId ? currentAttemptsInDb : 0, lockUntil: null };
    }

    loginAttempts[email].attempts++;
    const attempts = loginAttempts[email].attempts;

    // Si el usuario existe, actualizar contador en BD
    if (userId) {
        let lockUntilDate = null;
        if (attempts >= MAX_ATTEMPTS) {
            lockUntilDate = new Date(now + LOCK_TIME);
            loginAttempts[email].lockUntil = lockUntilDate.getTime(); // Actualizar bloqueo en memoria
        }
        try {
            await pool.query(
                'UPDATE Usuarios SET intentos_login = ?, bloqueado_hasta = ? WHERE id_usuario = ?',
                [attempts, lockUntilDate, userId]
            );
        } catch (dbError) {
            console.error("Error actualizando intentos de login en BD:", dbError);
            // No detener el flujo principal por esto, pero loguearlo
        }
    }
    return attempts;
}

/** Resetea los intentos fallidos para un email/usuario */
async function resetLoginAttempts(email, userId) {
    delete loginAttempts[email]; // Limpiar registro en memoria
    try {
        // Resetear también en la base de datos
        await pool.query(
            'UPDATE Usuarios SET intentos_login = 0, bloqueado_hasta = NULL WHERE id_usuario = ?',
            [userId]
        );
    } catch (dbError) {
        console.error("Error reseteando intentos de login en BD:", dbError);
    }
}

// Exportar la función de verificación de sesión
exports.checkSession = getSessionStatus;
