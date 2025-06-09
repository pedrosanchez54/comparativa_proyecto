#!/bin/bash

# Script para configurar DDNS en la aplicación Comparativa
echo "🌐 Configurador de DDNS para Comparativa de Vehículos"
echo "======================================================"

# Pedir el dominio DDNS al usuario
read -p "Ingresa tu dominio DDNS (ej: mi-proyecto.ddns.net): " DDNS_DOMAIN

if [ -z "$DDNS_DOMAIN" ]; then
    echo "❌ Error: Debes ingresar un dominio DDNS"
    exit 1
fi

echo "🔧 Configurando DDNS: $DDNS_DOMAIN"

# Función para hacer backup de archivos
backup_file() {
    if [ -f "$1" ]; then
        cp "$1" "$1.backup.$(date +%Y%m%d_%H%M%S)"
        echo "✅ Backup creado: $1.backup"
    fi
}

# 1. Actualizar backend/.env
echo "📝 Actualizando backend/.env..."
if [ -f "comparativa-backend/.env" ]; then
    backup_file "comparativa-backend/.env"
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$DDNS_DOMAIN:3000|g" comparativa-backend/.env
    echo "✅ Backend .env actualizado"
else
    echo "❌ No se encontró comparativa-backend/.env"
fi

# 2. Actualizar frontend/.env
echo "📝 Actualizando frontend/.env..."
if [ -f "comparativa-frontend/.env" ]; then
    backup_file "comparativa-frontend/.env"
    # Crear nueva configuración para producción
    cat > comparativa-frontend/.env << EOF
# URL de la API del backend (actualizado para DDNS)
REACT_APP_API_URL=http://$DDNS_DOMAIN:4000/api

# Configuración de la aplicación
REACT_APP_NAME=Comparativa de Vehículos
REACT_APP_DESCRIPTION=Compara y analiza diferentes vehículos
REACT_APP_VERSION=1.0.0

# Configuración de desarrollo
PORT=3000
BROWSER=none
FAST_REFRESH=true

# Configuración para producción
GENERATE_SOURCEMAP=false
EOF
    echo "✅ Frontend .env actualizado"
else
    echo "❌ No se encontró comparativa-frontend/.env"
fi

# 3. Actualizar server.js
echo "📝 Actualizando server.js..."
if [ -f "comparativa-backend/server.js" ]; then
    backup_file "comparativa-backend/server.js"
    sed -i "s|'http://TU_DDNS_AQUI:3000'|'http://$DDNS_DOMAIN:3000'|g" comparativa-backend/server.js
    sed -i "s|\"http://192.168.1.82:4000\"|\"http://$DDNS_DOMAIN:4000\"|g" comparativa-backend/server.js
    echo "✅ Server.js actualizado"
else
    echo "❌ No se encontró comparativa-backend/server.js"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo "=================================="
echo "✅ Dominio DDNS configurado: $DDNS_DOMAIN"
echo "✅ Frontend: http://$DDNS_DOMAIN:3000"
echo "✅ Backend: http://$DDNS_DOMAIN:4000"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura port forwarding en tu router:"
echo "   - Puerto 3000 → 192.168.1.82:3000"
echo "   - Puerto 4000 → 192.168.1.82:4000"
echo "2. Ejecuta: ./start-production.sh"
echo ""
echo "🔄 Si necesitas revertir los cambios, usa los archivos .backup" 