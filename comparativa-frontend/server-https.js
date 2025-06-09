const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuración SSL
const SSL_DIR = process.env.SSL_DIR || '/opt/comparativa/ssl';
const DEV_SSL_DIR = path.join(__dirname, 'ssl');

let sslOptions;
try {
  // Intentar usar certificados de producción primero
  sslOptions = {
    key: fs.readFileSync(path.join(SSL_DIR, 'privkey.pem')),
    cert: fs.readFileSync(path.join(SSL_DIR, 'fullchain.pem'))
  };
  console.log('🔒 Usando certificados SSL de producción');
} catch (error) {
  try {
    // Si fallan, usar certificados de desarrollo
    sslOptions = {
      key: fs.readFileSync(path.join(DEV_SSL_DIR, 'key.pem')),
      cert: fs.readFileSync(path.join(DEV_SSL_DIR, 'cert.pem'))
    };
    console.log('🔒 Usando certificados SSL de desarrollo');
  } catch (devError) {
    console.error('❌ No se encontraron certificados SSL');
    process.exit(1);
  }
}

const buildPath = path.join(__dirname, 'build');

// Función para determinar el content-type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Función para manejar requests
function handleRequest(req, res) {
  // Headers de seguridad
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // Si es la raíz, servir index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(buildPath, pathname);

  // Verificar si el archivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Si no existe, servir index.html para SPA routing
      const indexPath = path.join(buildPath, 'index.html');
      fs.readFile(indexPath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error interno del servidor');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });
    } else {
      // Servir el archivo
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error interno del servidor');
          return;
        }
        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(content);
      });
    }
  });
}

const PORT = parseInt(process.env.PORT) || 3000;

// Servidor HTTPS
const httpsServer = https.createServer(sslOptions, handleRequest);
httpsServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🔒 Frontend HTTPS escuchando en https://0.0.0.0:${PORT}`);
});

// Servidor HTTP para redirección
const httpServer = http.createServer((req, res) => {
  const httpsPort = PORT === 3000 ? '' : `:${PORT}`;
  const httpsUrl = `https://${req.headers.host.split(':')[0]}${httpsPort}${req.url}`;
  res.writeHead(301, { 'Location': httpsUrl });
  res.end();
});

const HTTP_PORT = PORT === 3000 ? 8001 : PORT + 1000;
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`🔄 Frontend HTTP (redirección) escuchando en http://0.0.0.0:${HTTP_PORT}`);
});

// Manejo de señales para cierre grácil
const gracefulShutdown = (signal) => {
  console.log(`\nRecibida señal ${signal}. Cerrando servidores frontend...`);
  httpsServer.close(() => {
    httpServer.close(() => {
      console.log('Servidores frontend cerrados correctamente');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT')); 