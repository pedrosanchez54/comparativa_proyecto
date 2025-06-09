#!/bin/bash

# Script para iniciar la aplicación en modo producción
echo "🚀 Iniciando Comparativa de Vehículos - Modo Producción"
echo "======================================================="

# Función para verificar si un puerto está ocupado
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Puerto $port está ocupado. Intentando liberar..."
        # Intentar matar procesos en el puerto
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
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm no está instalado"
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
    
    # Instalar dependencias si es necesario
    if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
        echo "📦 Instalando dependencias del frontend..."
        npm install
    fi
    
    # Construir para producción
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
    
    # Instalar dependencias si es necesario
    if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
        echo "📦 Instalando dependencias del backend..."
        npm install
    fi
    
    # Verificar que el puerto 4000 esté libre
    check_port 4000
    
    # Cambiar a modo producción
    export NODE_ENV=production
    
    # Iniciar el servidor en background
    echo "🚀 Iniciando servidor backend en puerto 4000..."
    nohup npm start > backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    
    cd ..
    
    # Esperar un momento para que el backend inicie
    sleep 5
    
    # Verificar que el backend esté funcionando
    if curl -s https://localhost:4000 > /dev/null; then
        echo "✅ Backend iniciado correctamente (PID: $BACKEND_PID)"
    else
        echo "❌ Error al iniciar el backend"
        cat comparativa-backend/backend.log
        exit 1
    fi
}

# Función para servir el frontend
serve_frontend() {
    echo "🌐 Sirviendo frontend..."
    cd comparativa-frontend
    
    # Verificar que el puerto 3000 esté libre
    check_port 3000
    
    # Servir archivos estáticos del build
    echo "🚀 Iniciando servidor frontend en puerto 3000..."
    nohup npx serve -s build -l 3000 > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    cd ..
    
    # Esperar un momento para que el frontend inicie
    sleep 3
    
    # Verificar que el frontend esté funcionando
    if curl -s https://localhost:3000 > /dev/null; then
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
    echo "🎉 ¡Aplicación iniciada correctamente!"
    echo "======================================="
    echo "🌐 Acceso local:"
    echo "   Frontend: https://localhost:3000"
    echo "   Backend:  https://localhost:4000"
    echo ""
    echo "🌍 Acceso desde red local:"
    echo "   Frontend: https://192.168.1.82:3000"
    echo "   Backend:  https://192.168.1.82:4000"
    echo ""
    
    # Mostrar información DDNS si está configurada
    if grep -q "DDNS_DOMAIN" comparativa-backend/.env 2>/dev/null; then
        DDNS_DOMAIN=$(grep "FRONTEND_URL" comparativa-backend/.env | cut -d'=' -f2 | sed 's|http://||' | sed 's|:3000||')
        if [ "$DDNS_DOMAIN" != "localhost" ]; then
            echo "🌐 Acceso desde internet (DDNS):"
            echo "   Frontend: https://$DDNS_DOMAIN"
            echo "   Backend:  https://$DDNS_DOMAIN/api"
            echo ""
        fi
    fi
    
    echo "📋 Comandos útiles:"
    echo "   Ver logs backend:  tail -f comparativa-backend/backend.log"
    echo "   Ver logs frontend: tail -f frontend.log"
    echo "   Detener todo:      ./stop-production.sh"
    echo ""
    echo "⚠️  IMPORTANTE: Configura port forwarding en tu router:"
    echo "   Puerto 3000 → 192.168.1.82:3000"
    echo "   Puerto 4000 → 192.168.1.82:4000"
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