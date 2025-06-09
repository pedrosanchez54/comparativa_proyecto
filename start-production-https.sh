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
    
    echo "🚀 Iniciando servidor frontend HTTPS en puerto 3000..."
    nohup node server-https.js > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    cd ..
    sleep 3
    
    if curl -k -s https://localhost:3000 > /dev/null; then
        echo "✅ Frontend HTTPS iniciado correctamente (PID: $FRONTEND_PID)"
    else
        echo "❌ Error al iniciar el frontend HTTPS"
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
    echo "   Frontend: https://localhost:3000"
    echo "   Backend:  https://localhost:4000"
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
