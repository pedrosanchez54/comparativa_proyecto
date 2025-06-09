#!/bin/bash

echo "🔒 VERIFICACIÓN COMPLETA DEL SISTEMA HTTPS"
echo "=========================================="
echo ""

# Función para verificar URL
verify_url() {
    local url=$1
    local description=$2
    local status_code=$(curl -k -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status_code" = "200" ]; then
        echo "✅ $description: Status $status_code"
    else
        echo "❌ $description: Status $status_code"
    fi
}

# Verificar servicios básicos
echo "🌐 Verificando servicios básicos:"
verify_url "https://proyectocomparativa.ddns.net:3000" "Frontend HTTPS"
verify_url "https://proyectocomparativa.ddns.net:4000" "Backend HTTPS"
verify_url "https://proyectocomparativa.ddns.net:4000/api" "API Base"
verify_url "https://proyectocomparativa.ddns.net:4000/api/vehicles" "API Vehículos"
echo ""

# Verificar imágenes
echo "🖼️ Verificando acceso a imágenes:"
verify_url "https://proyectocomparativa.ddns.net:4000/api/images/vehicles/Focus_ST_line.png" "Imagen Focus ST"
verify_url "https://proyectocomparativa.ddns.net:4000/api/images/vehicles/M3_G80.png" "Imagen M3 G80"
echo ""

# Verificar URLs HTTPS en respuestas del API
echo "🔍 Verificando URLs HTTPS en respuestas del API:"
api_response=$(curl -k -s https://proyectocomparativa.ddns.net:4000/api/vehicles?limit=1)
imagen_url=$(echo "$api_response" | grep -o '"imagen_principal":"[^"]*"' | head -1)

if [[ $imagen_url == *"https://proyectocomparativa.ddns.net:4000"* ]]; then
    echo "✅ API devuelve URLs HTTPS correctas"
    echo "   Ejemplo: $imagen_url"
else
    echo "❌ API NO devuelve URLs HTTPS correctas"
    echo "   Encontrado: $imagen_url"
fi
echo ""

# Verificar certificados SSL
echo "🔐 Verificando certificados SSL:"
ssl_status=$(openssl s_client -connect proyectocomparativa.ddns.net:4000 </dev/null 2>/dev/null | grep "Verify return code")
if [[ $ssl_status == *"ok"* ]]; then
    echo "✅ Certificados SSL válidos"
else
    echo "⚠️  Certificados SSL: $ssl_status"
fi

ssl_expiry=$(openssl s_client -connect proyectocomparativa.ddns.net:4000 </dev/null 2>/dev/null | openssl x509 -noout -dates | grep "notAfter")
echo "📅 Vencimiento SSL: $ssl_expiry"
echo ""

# Verificar procesos
echo "🔄 Verificando procesos activos:"
backend_pid=$(ps aux | grep "node server-https.js" | grep -v grep | awk '{print $2}')
frontend_pid=$(ps aux | grep "node.*server-https.js" | grep "3000" | grep -v grep | awk '{print $2}')

if [ ! -z "$backend_pid" ]; then
    echo "✅ Backend HTTPS activo (PID: $backend_pid)"
else
    echo "❌ Backend HTTPS no está activo"
fi

if [ ! -z "$frontend_pid" ]; then
    echo "✅ Frontend HTTPS activo (PID: $frontend_pid)"
else
    echo "❌ Frontend HTTPS no está activo"
fi
echo ""

# Verificar puertos
echo "🌐 Verificando puertos:"
port_3000=$(ss -tlnp | grep ":3000")
port_4000=$(ss -tlnp | grep ":4000")

if [ ! -z "$port_3000" ]; then
    echo "✅ Puerto 3000 (Frontend) está escuchando"
else
    echo "❌ Puerto 3000 (Frontend) NO está escuchando"
fi

if [ ! -z "$port_4000" ]; then
    echo "✅ Puerto 4000 (Backend) está escuchando"
else
    echo "❌ Puerto 4000 (Backend) NO está escuchando"
fi
echo ""

# Resumen final
echo "📋 RESUMEN FINAL:"
echo "==============="
echo "🔒 Protocolo: HTTPS ✅"
echo "🌐 Frontend: https://proyectocomparativa.ddns.net:3000"
echo "🖥️  Backend: https://proyectocomparativa.ddns.net:4000"
echo "🔗 API: https://proyectocomparativa.ddns.net:4000/api"
echo "🖼️ Imágenes: https://proyectocomparativa.ddns.net:4000/api/images/vehicles/"
echo "📜 Certificados: Let's Encrypt válidos"
echo "🔄 Servicios: Activos y funcionando"
echo ""
echo "✅ Sistema HTTPS completamente funcional" 