#!/bin/bash

# Script para configurar HTTPS en el frontend React
echo "🔒 Configurando HTTPS para React Frontend"
echo "========================================="

# Función para crear certificado self-signed para desarrollo local
create_dev_certificates() {
    echo "🔐 Creando certificados para desarrollo local..."
    
    # Crear directorio para certificados del frontend
    mkdir -p comparativa-frontend/ssl
    
    # Generar certificado self-signed para localhost
    openssl req -x509 -newkey rsa:4096 -keyout comparativa-frontend/ssl/key.pem -out comparativa-frontend/ssl/cert.pem -days 365 -nodes -subj "/C=ES/ST=Madrid/L=Madrid/O=Comparativa/OU=Dev/CN=localhost"
    
    echo "✅ Certificados de desarrollo creados"
}

# Función para configurar React para HTTPS
configure_react_https() {
    echo "⚙️  Configurando React para HTTPS..."
    
    # Backup del package.json actual
    cp comparativa-frontend/package.json comparativa-frontend/package.json.backup.http
    
    # Verificar si ya existe la configuración HTTPS
    if grep -q "HTTPS=true" comparativa-frontend/package.json; then
        echo "⚠️  React ya está configurado para HTTPS"
    else
        # Actualizar scripts para usar HTTPS
        sed -i 's/"start": "react-scripts start"/"start": "HTTPS=true SSL_CRT_FILE=ssl\/cert.pem SSL_KEY_FILE=ssl\/key.pem react-scripts start"/' comparativa-frontend/package.json
        echo "✅ React configurado para HTTPS"
    fi
}

# Función para actualizar .env del frontend
update_frontend_env() {
    echo "📝 Actualizando .env del frontend..."
    
    if [ ! -f "comparativa-frontend/.env" ]; then
        touch comparativa-frontend/.env
    fi
    
    # Backup del .env actual
    cp comparativa-frontend/.env comparativa-frontend/.env.backup.http
    
    # Configurar variables para HTTPS
    cat > comparativa-frontend/.env << 'EOF'
# Configuración HTTPS para React
HTTPS=true
SSL_CRT_FILE=ssl/cert.pem
SSL_KEY_FILE=ssl/key.pem

# URLs de la API con HTTPS
REACT_APP_API_URL=https://proyectocomparativa.ddns.net:4000/api
REACT_APP_IMAGE_BASE_URL=https://proyectocomparativa.ddns.net:4000

# Para desarrollo local
# REACT_APP_API_URL=https://localhost:4000/api
# REACT_APP_IMAGE_BASE_URL=https://localhost:4000
EOF

    echo "✅ .env del frontend actualizado"
}

# Función para mostrar instrucciones
show_instructions() {
    echo ""
    echo "🎉 ¡Frontend configurado para HTTPS!"
    echo "===================================="
    echo ""
    echo "🚀 Para iniciar el frontend con HTTPS:"
    echo "   cd comparativa-frontend"
    echo "   npm start"
    echo ""
    echo "🌐 El frontend estará disponible en:"
    echo "   https://localhost:3000"
    echo "   https://192.168.1.82:3000"
    echo "   https://proyectocomparativa.ddns.net:3000"
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "   - El navegador mostrará una advertencia de seguridad"
    echo "   - Haz clic en 'Avanzado' y 'Continuar a localhost'"
    echo "   - Esto es normal con certificados self-signed"
    echo ""
    echo "🔧 Para producción:"
    echo "   - Usa certificados SSL reales (Let's Encrypt)"
    echo "   - Ejecuta: sudo ./setup-ssl-nodejs.sh"
}

# Función principal
main() {
    echo "🚀 Iniciando configuración HTTPS para frontend..."
    
    create_dev_certificates
    configure_react_https
    update_frontend_env
    show_instructions
}

# Verificar que estamos en el directorio correcto
if [ ! -f "start-production.sh" ]; then
    echo "❌ Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar que existe el directorio del frontend
if [ ! -d "comparativa-frontend" ]; then
    echo "❌ No se encontró el directorio comparativa-frontend"
    exit 1
fi

# Ejecutar función principal
main 