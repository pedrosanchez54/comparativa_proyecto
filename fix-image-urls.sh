#!/bin/bash

# Script para actualizar URLs de imágenes hardcodeadas en el backend
echo "🖼️  Actualizando URLs de imágenes en el backend..."

# Leer el dominio DDNS del .env del backend
if [ -f "comparativa-backend/.env" ]; then
    DDNS_DOMAIN=$(grep "FRONTEND_URL" comparativa-backend/.env | cut -d'=' -f2 | sed 's|http://||' | sed 's|:3000||')
    
    if [ "$DDNS_DOMAIN" = "localhost" ]; then
        echo "⚠️  DDNS no configurado. Ejecuta ./configure-ddns.sh primero"
        exit 1
    fi
    
    echo "🔧 Actualizando URLs para: $DDNS_DOMAIN"
    
    # Buscar y reemplazar todas las URLs hardcodeadas en el backend
    find comparativa-backend -name "*.js" -type f -exec sed -i "s|http://192.168.1.82:4000|http://$DDNS_DOMAIN:4000|g" {} \;
    find comparativa-backend -name "*.js" -type f -exec sed -i "s|http://localhost:4000|http://$DDNS_DOMAIN:4000|g" {} \;
    
    echo "✅ URLs de backend actualizadas"
    
    # Actualizar también las URLs en el frontend si hay alguna hardcodeada
    echo "🔧 Actualizando URLs en frontend..."
    find comparativa-frontend/src -name "*.js" -o -name "*.jsx" -type f -exec sed -i "s|http://localhost:4000|${REACT_APP_API_URL%/api}|g" {} \;
    find comparativa-frontend/src -name "*.js" -o -name "*.jsx" -type f -exec sed -i "s|http://192.168.1.82:4000|${REACT_APP_API_URL%/api}|g" {} \;
    
    echo "✅ URLs actualizadas correctamente"
    echo ""
    echo "🔄 Para aplicar los cambios:"
    echo "   ./stop-production.sh"
    echo "   ./start-production.sh"
    
else
    echo "❌ No se encontró comparativa-backend/.env"
    exit 1
fi 