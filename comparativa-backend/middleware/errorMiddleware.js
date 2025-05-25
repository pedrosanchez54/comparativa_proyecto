/**
 * Middleware manejador de errores centralizado.
 * Captura errores lanzados por los controladores o middlewares anteriores.
 * Debe registrarse DESPUÉS de todas las rutas en server.js.
 * @param {Error} err - El objeto de error.
 * @param {object} req - Objeto de petición de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware (aunque aquí no se usa).
 */
function errorHandler(err, req, res, next) {
  // Loguear el error completo en la consola del servidor para depuración interna
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  // Mostrar el stack trace ayuda a encontrar dónde ocurrió el error
  console.error(err.stack || err);

  // Determinar el código de estado HTTP
  // Usar err.statusCode si está definido (ej. errores de validación), sino usar el de la respuesta si es > 200, o 500 por defecto.
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Determinar el mensaje de error a enviar al cliente
  // En producción, evitar enviar detalles internos para errores 500
  let message = 'Ha ocurrido un error inesperado en el servidor.';
  // Mostrar mensaje específico si no es un error 500 o si estamos en desarrollo
  if (process.env.NODE_ENV !== 'production' || statusCode < 500) {
      message = err.message || message;
  }

  // Enviar respuesta JSON formateada al cliente
  res.status(statusCode).json({
    message: message,
    // Opcional: añadir un código de error interno para referencia
    // errorCode: err.code || 'UNKNOWN_ERROR',
    // NUNCA enviar el stack trace completo al cliente en producción por seguridad
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

/**
 * Middleware para manejar rutas no encontradas (404).
 * Se registra después de todas las rutas válidas en server.js.
 * @param {object} req - Objeto de petición de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware (al errorHandler).
 */
function notFoundHandler(req, res, next) {
  const message = `La ruta solicitada '${req.originalUrl}' no fue encontrada en este servidor.`;
  // Establece el estado 404 y envía respuesta JSON
  res.status(404).json({ message: message });
  // Alternativamente, podrías pasar un error al siguiente middleware:
  // const error = new Error(message);
  // error.statusCode = 404;
  // next(error);
}

module.exports = { errorHandler, notFoundHandler }; 