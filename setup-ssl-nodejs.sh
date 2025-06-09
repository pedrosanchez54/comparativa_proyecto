#!/bin/bash

# Script para configurar SSL/TLS directamente en Node.js (sin nginx)
echo "🔒 Configurando SSL/TLS para Node.js"
echo "==================================="

# Función para verificar si el script se ejecuta como root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo "❌ Este script debe ejecutarse como root (sudo)"
        exit 1
    fi
}

# Función para instalar Certbot
install_certbot() {
    echo "📦 Instalando Certbot..."
    
    # Actualizar paquetes
    apt update
    
    # Instalar snapd si no está instalado
    if ! command -v snap &> /dev/null; then
        apt install snapd -y
        systemctl enable snapd
        systemctl start snapd
    fi
    
    # Instalar certbot via snap (método recomendado)
    snap install core; snap refresh core
    snap install --classic certbot
    
    # Crear enlace simbólico
    ln -sf /snap/bin/certbot /usr/bin/certbot
    
    echo "✅ Certbot instalado correctamente"
}

# Función para detener servicios temporalmente
stop_services() {
    echo "⏸️  Deteniendo servicios temporalmente..."
    
    # Detener la aplicación si está corriendo
    if [ -f "frontend.pid" ]; then
        kill $(cat frontend.pid) 2>/dev/null || true
        rm -f frontend.pid
    fi
    
    if [ -f "comparativa-backend/backend.pid" ]; then
        kill $(cat comparativa-backend/backend.pid) 2>/dev/null || true
        rm -f comparativa-backend/backend.pid
    fi
    
    # Liberar puertos
    sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
    sudo lsof -ti:4000 | xargs sudo kill -9 2>/dev/null || true
    sudo lsof -ti:80 | xargs sudo kill -9 2>/dev/null || true
    
    sleep 3
    echo "✅ Servicios detenidos"
}

# Función para obtener certificado SSL usando standalone
get_ssl_certificate() {
    echo "🔒 Obteniendo certificado SSL..."
    
    # Obtener certificado usando modo standalone (necesita puerto 80 libre)
    certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email pedro.sanchez.comparativa@gmail.com \
        -d proyectocomparativa.ddns.net
    
    if [ $? -eq 0 ]; then
        echo "✅ Certificado SSL obtenido correctamente"
    else
        echo "❌ Error al obtener el certificado SSL"
        echo "💡 Verifica que:"
        echo "   - El dominio proyectocomparativa.ddns.net apunte a tu IP pública"
        echo "   - El puerto 80 esté abierto en tu router"
        echo "   - No haya firewall bloqueando el puerto 80"
        exit 1
    fi
}

# Función para crear directorio de certificados accesible para Node.js
setup_ssl_directory() {
    echo "📁 Configurando directorio SSL para Node.js..."
    
    # Crear directorio para los certificados
    mkdir -p /opt/comparativa/ssl
    
    # Copiar certificados al directorio de la aplicación
    cp /etc/letsencrypt/live/proyectocomparativa.ddns.net/fullchain.pem /opt/comparativa/ssl/
    cp /etc/letsencrypt/live/proyectocomparativa.ddns.net/privkey.pem /opt/comparativa/ssl/
    
    # Cambiar permisos para que Node.js pueda leerlos
    chown -R pedro:pedro /opt/comparativa/ssl
    chmod 644 /opt/comparativa/ssl/fullchain.pem
    chmod 600 /opt/comparativa/ssl/privkey.pem
    
    # Crear enlace simbólico en el proyecto
    ln -sf /opt/comparativa/ssl ./ssl
    
    echo "✅ Certificados configurados para Node.js"
}

# Función para configurar renovación automática
setup_auto_renewal() {
    echo "🔄 Configurando renovación automática..."
    
    # Crear script de renovación que actualiza los certificados de Node.js
    cat > /usr/local/bin/renew-ssl-nodejs.sh << 'EOF'
#!/bin/bash
# Renovar certificados
certbot renew --quiet --pre-hook "systemctl stop nginx 2>/dev/null || true" --post-hook "systemctl start nginx 2>/dev/null || true"

# Copiar certificados renovados al directorio de Node.js
if [ -f "/etc/letsencrypt/live/proyectocomparativa.ddns.net/fullchain.pem" ]; then
    cp /etc/letsencrypt/live/proyectocomparativa.ddns.net/fullchain.pem /opt/comparativa/ssl/
    cp /etc/letsencrypt/live/proyectocomparativa.ddns.net/privkey.pem /opt/comparativa/ssl/
    chown -R pedro:pedro /opt/comparativa/ssl
    chmod 644 /opt/comparativa/ssl/fullchain.pem
    chmod 600 /opt/comparativa/ssl/privkey.pem
    
    # Reiniciar la aplicación si está corriendo
    if [ -f "/home/pedro/comparativa_proyecto/comparativa-backend/backend.pid" ]; then
        cd /home/pedro/comparativa_proyecto
        ./stop-production.sh
        sleep 5
        ./start-production-https.sh
    fi
fi
EOF
    
    chmod +x /usr/local/bin/renew-ssl-nodejs.sh
    
    # Añadir tarea cron para renovación automática (cada día a las 2:30 AM)
    crontab -l 2>/dev/null | grep -v "renew-ssl-nodejs.sh" | crontab -
    (crontab -l 2>/dev/null; echo "30 2 * * * /usr/local/bin/renew-ssl-nodejs.sh") | crontab -
    
    echo "✅ Renovación automática configurada"
}

# Función para configurar firewall
configure_firewall() {
    echo "🔥 Configurando firewall..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 3000/tcp
        ufw allow 4000/tcp
        ufw allow 22/tcp
        echo "✅ Firewall configurado"
    else
        echo "⚠️  UFW no está instalado. Asegúrate de que los puertos estén abiertos"
    fi
}

# Función para actualizar el servidor backend para HTTPS
update_backend_for_https() {
    echo "🖥️  Configurando backend para HTTPS..."
    
    cd /home/pedro/comparativa_proyecto/comparativa-backend
    
    # Backup del server.js actual
    cp server.js server.js.backup.before.https
    
    # Crear nueva versión del server.js con soporte HTTPS
    cat > server-https.js << 'EOF'
// Ruta: ~/comparativa_proyecto/comparativa-backend/server-https.js

// Cargar variables de entorno desde .env al inicio de todo
require('dotenv').config();

// Importar módulos necesarios
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');

// Importar configuración y middlewares propios
const { testDbConnection } = require('./config/db');
const httpLogger = require('./middleware/loggingMiddleware');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

// Importar todos los archivos de rutas
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const listRoutes = require('./routes/listRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const userRoutes = require('./routes/userRoutes');
const timeRoutes = require('./routes/timeRoutes');
const imageRoutes = require('./routes/imageRoutes');

// Crear la instancia de la aplicación Express
const app = express();

// Probar la conexión a la base de datos al iniciar el servidor
testDbConnection();

// --- Configuración SSL ---
const SSL_DIR = process.env.SSL_DIR || '/opt/comparativa/ssl';
const sslOptions = {
  key: fs.readFileSync(path.join(SSL_DIR, 'privkey.pem')),
  cert: fs.readFileSync(path.join(SSL_DIR, 'fullchain.pem'))
};

// --- Middlewares Esenciales ---

// 1. CORS
app.use(cors({
  origin: [
    'https://localhost:3000',
    'https://192.168.1.82:3000',
    'https://proyectocomparativa.ddns.net:3000',
    'https://proyectocomparativa.ddns.net'
  ],
  credentials: true
}));

// 2. Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https://proyectocomparativa.ddns.net:4000"],
    },
  },
}));

// 3. Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Logger
app.use(httpLogger);

// 4.5. Servir archivos estáticos
app.use('/api/images/vehicles', express.static(path.join(__dirname, '../comparativa-frontend/public/img/vehicles')));

// 5. Sesiones (configuradas para HTTPS)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS obligatorio
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_LIFETIME || 86400000),
    sameSite: 'lax'
  },
  name: process.env.SESSION_COOKIE_NAME || 'comparativa_app_sid'
}));

// --- Montaje de Rutas ---
const apiPrefix = '/api';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/vehicles`, vehicleRoutes);
app.use(`${apiPrefix}/lists`, listRoutes);
app.use(`${apiPrefix}/favorites`, favoriteRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/times`, timeRoutes);
app.use(`${apiPrefix}/images`, imageRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ 
        message: `Bienvenido al Backend HTTPS de Comparativa App - ${new Date().toLocaleTimeString()}`,
        protocol: 'HTTPS',
        secure: true
    });
});

// Middlewares de error
app.use(notFoundHandler);
app.use(errorHandler);

// --- Iniciar Servidores ---
const PORT = process.env.PORT || 4000;

// Servidor HTTPS (principal)
const httpsServer = https.createServer(sslOptions, app);
httpsServer.listen(PORT, '0.0.0.0', () => {
  console.log(`-------------------------------------------------------`);
  console.log(`🔒 Servidor Backend HTTPS escuchando en https://0.0.0.0:${PORT}`);
  console.log(`      Entorno: ${process.env.NODE_ENV}`);
  console.log(`      Frontend esperado en: ${process.env.FRONTEND_URL}`);
  console.log(`      SSL: Habilitado`);
  console.log(`-------------------------------------------------------`);
});

// Servidor HTTP (solo para redirección)
const httpApp = express();
httpApp.use((req, res) => {
  const httpsPort = PORT === 4000 ? '' : `:${PORT}`;
  const httpsUrl = `https://${req.headers.host.split(':')[0]}${httpsPort}${req.url}`;
  res.redirect(301, httpsUrl);
});

const httpServer = http.createServer(httpApp);
const HTTP_PORT = PORT === 4000 ? 8080 : PORT + 1000;
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`🔄 Servidor HTTP (redirección) escuchando en http://0.0.0.0:${HTTP_PORT}`);
});

// Manejo de señales para cierre grácil
const gracefulShutdown = (signal) => {
    console.log(`\nRecibida señal ${signal}. Cerrando servidores...`);
    httpsServer.close(() => {
        httpServer.close(() => {
            console.log('Servidores cerrados correctamente');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
EOF
    
    echo "✅ Backend configurado para HTTPS"
}

# Función para mostrar información post-instalación
show_post_install_info() {
    echo ""
    echo "🎉 ¡SSL/TLS configurado para Node.js!"
    echo "====================================="
    echo ""
    echo "🔒 Tu aplicación estará disponible en:"
    echo "   Frontend: https://proyectocomparativa.ddns.net:3000"
    echo "   Backend:  https://proyectocomparativa.ddns.net:4000"
    echo ""
    echo "⚠️  IMPORTANTE - Configuración del router:"
    echo "   1. Abre el puerto 80 (HTTP) → 192.168.1.82:80 (para renovación SSL)"
    echo "   2. Abre el puerto 3000 (Frontend HTTPS) → 192.168.1.82:3000"
    echo "   3. Abre el puerto 4000 (Backend HTTPS) → 192.168.1.82:4000"
    echo ""
    echo "🔧 Próximos pasos:"
    echo "   1. Actualizar todas las URLs en el código"
    echo "   2. Ejecutar: ./start-production-https.sh"
    echo "   3. Probar el acceso HTTPS"
    echo ""
    echo "📋 Comandos útiles:"
    echo "   Ver certificados: ls -la /opt/comparativa/ssl/"
    echo "   Renovar SSL:      sudo /usr/local/bin/renew-ssl-nodejs.sh"
    echo "   Ver logs:         tail -f comparativa-backend/backend.log"
}

# Función principal
main() {
    echo "🚀 Iniciando configuración SSL/TLS para Node.js..."
    
    check_root
    install_certbot
    stop_services
    get_ssl_certificate
    setup_ssl_directory
    update_backend_for_https
    setup_auto_renewal
    configure_firewall
    show_post_install_info
}

# Verificar que estamos en el directorio correcto
if [ ! -f "start-production.sh" ]; then
    echo "❌ Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Ejecutar función principal
main 