#!/bin/bash

# Script para migrar todas las URLs HTTP a HTTPS
echo "🔒 Migrando URLs HTTP a HTTPS"
echo "============================="

# Función para crear backup
create_backup() {
    echo "💾 Creando backup de seguridad..."
    
    backup_dir="backup_antes_https_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup de archivos críticos
    cp -r comparativa-backend "$backup_dir/"
    cp -r comparativa-frontend/src "$backup_dir/"
    cp *.sh "$backup_dir/" 2>/dev/null || true
    cp *.md "$backup_dir/" 2>/dev/null || true
    
    echo "✅ Backup creado en: $backup_dir"
}

# Función para actualizar backend .env
update_backend_env() {
    echo "⚙️  Actualizando configuración del backend..."
    
    if [ -f "comparativa-backend/.env" ]; then
        # Backup del .env actual
        cp comparativa-backend/.env comparativa-backend/.env.backup.http
        
        # Actualizar URLs HTTP a HTTPS
        sed -i 's|http://proyectocomparativa.ddns.net|https://proyectocomparativa.ddns.net|g' comparativa-backend/.env
        sed -i 's|http://localhost|https://localhost|g' comparativa-backend/.env
        sed -i 's|http://192.168.1.82|https://192.168.1.82|g' comparativa-backend/.env
        
        echo "✅ Backend .env actualizado"
    else
        echo "⚠️  No se encontró comparativa-backend/.env"
    fi
}

# Función para actualizar frontend .env
update_frontend_env() {
    echo "⚙️  Actualizando configuración del frontend..."
    
    if [ -f "comparativa-frontend/.env" ]; then
        # Backup del .env actual
        cp comparativa-frontend/.env comparativa-frontend/.env.backup.http
        
        # Actualizar URLs HTTP a HTTPS
        sed -i 's|http://proyectocomparativa.ddns.net|https://proyectocomparativa.ddns.net|g' comparativa-frontend/.env
        sed -i 's|http://localhost|https://localhost|g' comparativa-frontend/.env
        sed -i 's|http://192.168.1.82|https://192.168.1.82|g' comparativa-frontend/.env
        
        echo "✅ Frontend .env actualizado"
    else
        echo "⚠️  No se encontró comparativa-frontend/.env"
    fi
}

# Función para actualizar server.js
update_server_js() {
    echo "🖥️  Actualizando server.js del backend..."
    
    # Backup
    cp comparativa-backend/server.js comparativa-backend/server.js.backup.http
    
    # Actualizar CORS origins
    sed -i "s|'http://localhost:3000'|'https://localhost:3000'|g" comparativa-backend/server.js
    sed -i "s|'http://localhost:3001'|'https://localhost:3001'|g" comparativa-backend/server.js
    sed -i "s|'http://localhost:3002'|'https://localhost:3002'|g" comparativa-backend/server.js
    sed -i "s|'http://192.168.1.82:3000'|'https://192.168.1.82:3000'|g" comparativa-backend/server.js
    sed -i "s|'http://proyectocomparativa.ddns.net:3000'|'https://proyectocomparativa.ddns.net:3000'|g" comparativa-backend/server.js
    
    # Actualizar CSP img-src
    sed -i 's|"http://proyectocomparativa.ddns.net:4000"|"https://proyectocomparativa.ddns.net:4000"|g' comparativa-backend/server.js
    
    # Configurar cookies para HTTPS
    sed -i 's|secure: process.env.NODE_ENV === '\''production'\''|secure: true|g' comparativa-backend/server.js
    
    echo "✅ server.js actualizado"
}

# Función para actualizar controladores del backend
update_backend_controllers() {
    echo "🎮 Actualizando controladores del backend..."
    
    # Actualizar todas las URLs en los controladores
    find comparativa-backend/controllers -name "*.js" -type f -exec sed -i 's|http://proyectocomparativa.ddns.net:4000|https://proyectocomparativa.ddns.net:4000|g' {} \;
    find comparativa-backend/controllers -name "*.js" -type f -exec sed -i 's|http://localhost:4000|https://localhost:4000|g' {} \;
    find comparativa-backend/controllers -name "*.js" -type f -exec sed -i 's|http://192.168.1.82:4000|https://192.168.1.82:4000|g' {} \;
    
    echo "✅ Controladores del backend actualizados"
}

# Función para actualizar api.js del frontend
update_frontend_api() {
    echo "🌐 Actualizando api.js del frontend..."
    
    if [ -f "comparativa-frontend/src/services/api.js" ]; then
        # Backup
        cp comparativa-frontend/src/services/api.js comparativa-frontend/src/services/api.js.backup.http
        
        # Actualizar URLs en comentarios y código
        sed -i "s|'http://localhost:4000/api'|'https://localhost:4000/api'|g" comparativa-frontend/src/services/api.js
        sed -i "s|'http://192.168.1.82:4000/api'|'https://192.168.1.82:4000/api'|g" comparativa-frontend/src/services/api.js
        sed -i "s|'http://TU_DDNS_AQUI:4000/api'|'https://proyectocomparativa.ddns.net:4000/api'|g" comparativa-frontend/src/services/api.js
        sed -i "s|http://localhost:4000/api|https://localhost:4000/api|g" comparativa-frontend/src/services/api.js
        
        echo "✅ api.js del frontend actualizado"
    else
        echo "⚠️  No se encontró comparativa-frontend/src/services/api.js"
    fi
}

# Función para actualizar todos los archivos del frontend
update_frontend_files() {
    echo "📱 Actualizando archivos del frontend..."
    
    # Actualizar todos los archivos JS/JSX del frontend
    find comparativa-frontend/src -name "*.js" -o -name "*.jsx" -type f -exec sed -i 's|http://proyectocomparativa.ddns.net:4000|https://proyectocomparativa.ddns.net:4000|g' {} \;
    find comparativa-frontend/src -name "*.js" -o -name "*.jsx" -type f -exec sed -i 's|http://localhost:4000|https://localhost:4000|g' {} \;
    find comparativa-frontend/src -name "*.js" -o -name "*.jsx" -type f -exec sed -i 's|http://192.168.1.82:4000|https://192.168.1.82:4000|g' {} \;
    
    echo "✅ Archivos del frontend actualizados"
}

# Función para actualizar scripts de gestión
update_management_scripts() {
    echo "📜 Actualizando scripts de gestión..."
    
    # Actualizar start-production.sh
    if [ -f "start-production.sh" ]; then
        cp start-production.sh start-production.sh.backup.http
        sed -i 's|http://localhost:3000|https://localhost:3000|g' start-production.sh
        sed -i 's|http://localhost:4000|https://localhost:4000|g' start-production.sh
        sed -i 's|http://192.168.1.82:3000|https://192.168.1.82:3000|g' start-production.sh
        sed -i 's|http://192.168.1.82:4000|https://192.168.1.82:4000|g' start-production.sh
        sed -i 's|http://$DDNS_DOMAIN:3000|https://$DDNS_DOMAIN:3000|g' start-production.sh
        sed -i 's|http://$DDNS_DOMAIN:4000|https://$DDNS_DOMAIN:4000|g' start-production.sh
    fi
    
    # Actualizar configure-ddns.sh
    if [ -f "configure-ddns.sh" ]; then
        cp configure-ddns.sh configure-ddns.sh.backup.http
        sed -i 's|http://$DDNS_DOMAIN:3000|https://$DDNS_DOMAIN:3000|g' configure-ddns.sh
        sed -i 's|http://$DDNS_DOMAIN:4000|https://$DDNS_DOMAIN:4000|g' configure-ddns.sh
    fi
    
    # Actualizar otros scripts
    sed -i 's|https://proyectocomparativa.ddns.net|https://proyectocomparativa.ddns.net|g' *.sh 2>/dev/null || true
    sed -i 's|https://proyectocomparativa.ddns.net/api|https://proyectocomparativa.ddns.net/api|g' *.sh 2>/dev/null || true
    
    echo "✅ Scripts de gestión actualizados"
}

# Función para actualizar documentación
update_documentation() {
    echo "📚 Actualizando documentación..."
    
    # Actualizar README-DEPLOYMENT.md
    if [ -f "README-DEPLOYMENT.md" ]; then
        cp README-DEPLOYMENT.md README-DEPLOYMENT.md.backup.http
        sed -i 's|http://tu-dominio.ddns.net:3000|https://tu-dominio.ddns.net:3000|g' README-DEPLOYMENT.md
        sed -i 's|http://tu-dominio.ddns.net:4000|https://tu-dominio.ddns.net:4000|g' README-DEPLOYMENT.md
        sed -i 's|http://localhost:3000|https://localhost:3000|g' README-DEPLOYMENT.md
        sed -i 's|http://localhost:4000|https://localhost:4000|g' README-DEPLOYMENT.md
        sed -i 's|http://192.168.1.82:3000|https://192.168.1.82:3000|g' README-DEPLOYMENT.md
        sed -i 's|http://192.168.1.82:4000|https://192.168.1.82:4000|g' README-DEPLOYMENT.md
    fi
    
    # Actualizar memoria_proyecto.md
    if [ -f "memoria_proyecto.md" ]; then
        cp memoria_proyecto.md memoria_proyecto.md.backup.http
        sed -i 's|https://proyectocomparativa.ddns.net|https://proyectocomparativa.ddns.net|g' memoria_proyecto.md
        sed -i 's|https://proyectocomparativa.ddns.net/api|https://proyectocomparativa.ddns.net/api|g' memoria_proyecto.md
    fi
    
    echo "✅ Documentación actualizada"
}

# Función para crear archivo .env si no existe
create_env_files() {
    echo "📄 Verificando archivos .env..."
    
    # Backend .env
    if [ ! -f "comparativa-backend/.env" ]; then
        echo "📝 Creando comparativa-backend/.env..."
        cat > comparativa-backend/.env << 'EOF'
# Configuración del Backend - HTTPS
NODE_ENV=production
PORT=4000

# Base de datos
DB_HOST=localhost
DB_USER=comparativa_user
DB_PASSWORD=Comp4r4t1v4_P4ssw0rd!
DB_DATABASE=comparativa_vehiculos
DB_PORT=3306

# Sesiones
SESSION_SECRET=mi_clave_super_secreta_para_sesiones_2024_comparativa_vehiculos_pedro_sanchez
SESSION_LIFETIME=86400000
SESSION_COOKIE_NAME=comparativa_app_sid

        # URLs con HTTPS
        FRONTEND_URL=https://proyectocomparativa.ddns.net:3000
        BASE_URL=https://proyectocomparativa.ddns.net:4000

# Configuración SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=pedro.sanchez.comparativa@gmail.com
SMTP_PASS=tu_app_password_aqui
EOF
        echo "✅ Backend .env creado"
    fi
    
    # Frontend .env
    if [ ! -f "comparativa-frontend/.env" ]; then
        echo "📝 Creando comparativa-frontend/.env..."
        cat > comparativa-frontend/.env << 'EOF'
        # Configuración del Frontend - HTTPS
        REACT_APP_API_URL=https://proyectocomparativa.ddns.net:4000/api
        REACT_APP_IMAGE_BASE_URL=https://proyectocomparativa.ddns.net:4000
        HTTPS=true
EOF
        echo "✅ Frontend .env creado"
    fi
}

# Función para actualizar start-production para HTTPS
update_start_production_for_https() {
    echo "🚀 Actualizando start-production.sh para HTTPS..."
    
    cat > start-production-https.sh << 'EOF'
#!/bin/bash

# Script para iniciar la aplicación en modo producción con HTTPS
echo "🔒 Iniciando Comparativa de Vehículos - Modo Producción HTTPS"
echo "============================================================="

# Función para verificar si un puerto está ocupado
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Puerto $port está ocupado. Intentando liberar..."
        sudo lsof -ti:$port | xargs sudo kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Función para verificar prerequisitos
check_prerequisites() {
    echo "🔍 Verificando prerequisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js no está instalado"
        exit 1
    fi
    
    # Verificar que existen los certificados SSL
    if [ ! -f "/opt/comparativa/ssl/fullchain.pem" ]; then
        echo "❌ Certificados SSL no encontrados. Ejecuta primero setup-ssl-nodejs.sh"
        exit 1
    fi
    
    # Verificar MySQL
    if ! systemctl is-active --quiet mysql; then
        echo "🔄 Iniciando MySQL..."
        sudo systemctl start mysql
        sleep 3
    fi
    
    echo "✅ Prerequisitos verificados"
}

# Función para construir el frontend
build_frontend() {
    echo "🏗️  Construyendo frontend..."
    cd comparativa-frontend
    
    if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
        echo "📦 Instalando dependencias del frontend..."
        npm install
    fi
    
    echo "⚒️  Ejecutando build de producción..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend construido correctamente"
    else
        echo "❌ Error al construir el frontend"
        exit 1
    fi
    
    cd ..
}

# Función para iniciar el backend
start_backend() {
    echo "🖥️  Iniciando backend..."
    cd comparativa-backend
    
    if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
        echo "📦 Instalando dependencias del backend..."
        npm install
    fi
    
    check_port 4000
    export NODE_ENV=production
    
    echo "🚀 Iniciando servidor backend HTTPS en puerto 4000..."
    nohup node server-https.js > backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    
    cd ..
    sleep 5
    
    if curl -k -s https://localhost:4000 > /dev/null; then
        echo "✅ Backend HTTPS iniciado correctamente (PID: $BACKEND_PID)"
    else
        echo "❌ Error al iniciar el backend HTTPS"
        cat comparativa-backend/backend.log
        exit 1
    fi
}

# Función para servir el frontend
serve_frontend() {
    echo "🌐 Sirviendo frontend..."
    cd comparativa-frontend
    
    check_port 3000
    
    echo "🚀 Iniciando servidor frontend en puerto 3000..."
    nohup npx serve -s build -l 3000 > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    cd ..
    sleep 3
    
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend iniciado correctamente (PID: $FRONTEND_PID)"
    else
        echo "❌ Error al iniciar el frontend"
        cat frontend.log
        exit 1
    fi
}

# Función para mostrar información de acceso
show_access_info() {
    echo ""
    echo "🎉 ¡Aplicación iniciada correctamente con HTTPS!"
    echo "================================================"
    echo "🔒 Acceso HTTPS:"
    echo "   Frontend:   https://proyectocomparativa.ddns.net:3000"
    echo "   Backend:    https://proyectocomparativa.ddns.net:4000"
    echo "   API:        https://proyectocomparativa.ddns.net:4000/api"
    echo ""
    echo "🌐 Acceso local (para desarrollo):"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:4000"
    echo ""
    echo "📋 Comandos útiles:"
    echo "   Ver logs backend:  tail -f comparativa-backend/backend.log"
    echo "   Ver logs frontend: tail -f frontend.log"
    echo "   Ver logs SSL:      ls -la /opt/comparativa/ssl/"
    echo "   Renovar SSL:       sudo /usr/local/bin/renew-ssl-nodejs.sh"
    echo "   Detener todo:      ./stop-production.sh"
    echo ""
    echo "✅ HTTPS está configurado y funcionando"
}

# Función principal
main() {
    check_prerequisites
    build_frontend
    start_backend
    serve_frontend
    show_access_info
}

# Ejecutar función principal
main
EOF

    chmod +x start-production-https.sh
    echo "✅ start-production-https.sh creado"
}

# Función para mostrar resumen de cambios
show_migration_summary() {
    echo ""
    echo "🎉 ¡Migración a HTTPS completada!"
    echo "================================="
    echo ""
    echo "📝 Archivos actualizados:"
    echo "   ✅ Configuración del backend (.env, server.js)"
    echo "   ✅ Configuración del frontend (.env, api.js)"
    echo "   ✅ Controladores del backend"
    echo "   ✅ Scripts de gestión"
    echo "   ✅ Documentación"
    echo ""
    echo "💾 Backups creados con extensión .backup.http"
    echo ""
    echo "🔧 Próximos pasos:"
    echo "   1. Ejecutar: sudo ./setup-ssl.sh"
    echo "   2. Configurar port-forwarding del router:"
    echo "      - Puerto 80 → 192.168.1.82:80"
    echo "      - Puerto 443 → 192.168.1.82:443"
    echo "   3. Ejecutar: ./start-production-https.sh"
    echo "   4. Acceder a: https://proyectocomparativa.ddns.net"
    echo ""
    echo "⚠️  IMPORTANTE: Después de configurar SSL, usa start-production-https.sh"
}

# Función principal
main() {
    echo "🚀 Iniciando migración a HTTPS..."
    
    create_backup
    create_env_files
    update_backend_env
    update_frontend_env
    update_server_js
    update_backend_controllers
    update_frontend_api
    update_frontend_files
    update_management_scripts
    update_documentation
    update_start_production_for_https
    show_migration_summary
}

# Verificar que estamos en el directorio correcto
if [ ! -f "start-production.sh" ]; then
    echo "❌ Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Ejecutar función principal
main 