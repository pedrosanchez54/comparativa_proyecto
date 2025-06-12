const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://proyectocomparativa.ddns.net:4000"]
        }
    }
}));

// Configuración de SSL
const sslOptions = {
    key: fs.readFileSync('/opt/comparativa/ssl/privkey.pem'),
    cert: fs.readFileSync('/opt/comparativa/ssl/fullchain.pem')
};

// Servir archivos estáticos desde la carpeta build
app.use(express.static(path.join(__dirname, 'build')));

// Redirigir todas las peticiones a index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Crear servidor HTTPS
const server = https.createServer(sslOptions, app);

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor frontend HTTPS iniciado en puerto ${PORT}`);
    console.log(`🌐 Acceso: https://localhost:${PORT}`);
    console.log(`🔒 SSL configurado correctamente`);
}); 