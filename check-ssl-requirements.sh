#!/bin/bash

# Script para verificar requisitos SSL antes de obtener certificados
echo "🔍 Verificando Requisitos SSL"
echo "============================"

# Función para verificar resolución DNS
check_dns() {
    echo "🌐 Verificando resolución DNS..."
    
    domain="proyectocomparativa.ddns.net"
    
    # Obtener IP actual del sistema
    local_ip=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null)
    
    # Resolver el dominio
    resolved_ip=$(dig +short $domain 2>/dev/null || nslookup $domain 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
    
    echo "   IP pública actual: $local_ip"
    echo "   IP del dominio:    $resolved_ip"
    
    if [ "$local_ip" = "$resolved_ip" ]; then
        echo "✅ DNS resuelve correctamente"
        return 0
    else
        echo "❌ DNS no apunta a tu IP actual"
        echo "💡 Ve a No-IP y actualiza la dirección"
        return 1
    fi
}

# Función para verificar puerto 80
check_port_80() {
    echo "🔌 Verificando acceso al puerto 80..."
    
    # Verificar si hay algo escuchando en puerto 80 localmente
    if netstat -tlnp 2>/dev/null | grep -q ":80 "; then
        echo "⚠️  Puerto 80 está ocupado localmente:"
        netstat -tlnp 2>/dev/null | grep ":80 "
        echo "💡 Detén el servicio que usa el puerto 80"
        return 1
    fi
    
    # Intentar bind temporalmente al puerto 80 para verificar
    if timeout 2 nc -l 80 >/dev/null 2>&1; then
        echo "✅ Puerto 80 disponible localmente"
    else
        echo "❌ No se puede usar el puerto 80 localmente"
        echo "💡 Ejecuta como sudo o verifica permisos"
        return 1
    fi
}

# Función para verificar conectividad externa
check_external_access() {
    echo "🌍 Verificando acceso externo al puerto 80..."
    
    domain="proyectocomparativa.ddns.net"
    
    # Crear servidor temporal en puerto 80
    echo "🔄 Iniciando servidor temporal en puerto 80..."
    echo "TEST_SSL_CHECK" > /tmp/ssl_test.html
    
    # Usar Python para crear servidor HTTP simple
    cd /tmp
    timeout 30 python3 -m http.server 80 >/dev/null 2>&1 &
    server_pid=$!
    
    sleep 3
    
    # Probar acceso externo
    echo "🧪 Probando acceso desde internet..."
    
    # Usar un servicio externo para probar la conectividad
    external_test=$(timeout 10 curl -s "https://check-host.net/check-http?host=http://$domain/ssl_test.html" 2>/dev/null)
    
    # Matar servidor temporal
    kill $server_pid 2>/dev/null
    wait $server_pid 2>/dev/null
    rm -f /tmp/ssl_test.html
    
    # Prueba manual más simple
    echo "💡 Prueba manual: abre en tu navegador desde otra red:"
    echo "   http://$domain/"
    echo "   (debería mostrar error de conexión si el puerto está cerrado)"
    
    return 0
}

# Función para mostrar configuración del router
show_router_config() {
    echo ""
    echo "📋 CONFIGURACIÓN DEL ROUTER NECESARIA"
    echo "====================================="
    echo ""
    echo "🔧 Port Forwarding a configurar:"
    echo "   Puerto Externo: 80"
    echo "   Puerto Interno: 80"
    echo "   IP Interna: 192.168.1.82"
    echo "   Protocolo: TCP"
    echo ""
    echo "📍 Pasos para configurar:"
    echo "   1. Abre tu router (generalmente http://192.168.1.1)"
    echo "   2. Ve a 'Avanzado' o 'Advanced'"
    echo "   3. Busca 'Port Forwarding' o 'Reenvío de puertos'"
    echo "   4. Añade una nueva regla:"
    echo "      - Nombre: SSL_HTTP"
    echo "      - Puerto externo: 80"
    echo "      - IP interna: 192.168.1.82"
    echo "      - Puerto interno: 80"
    echo "      - Protocolo: TCP"
    echo "   5. Guarda y reinicia el router si es necesario"
    echo ""
    echo "⚠️  IMPORTANTE: El puerto 80 solo es necesario para obtener/renovar SSL"
}

# Función para mostrar alternativas
show_alternatives() {
    echo ""
    echo "🔄 ALTERNATIVAS SI NO PUEDES ABRIR PUERTO 80"
    echo "============================================"
    echo ""
    echo "1. 🏠 Certificados Self-Signed (solo desarrollo):"
    echo "   ./setup-frontend-https.sh"
    echo ""
    echo "2. 📱 Validación DNS (si tu proveedor lo permite):"
    echo "   - Requiere acceso a configuración DNS"
    echo "   - Más complejo pero no necesita puerto 80"
    echo ""
    echo "3. ☁️  Usar un proxy/CDN como Cloudflare:"
    echo "   - Cloudflare proporciona SSL automáticamente"
    echo "   - Requiere cambiar nameservers"
    echo ""
    echo "4. 🔧 Usar puerto diferente (no estándar):"
    echo "   - Los usuarios tendrían que especificar puerto"
    echo "   - Ejemplo: https://proyectocomparativa.ddns.net:8443"
}

# Función principal
main() {
    echo "🚀 Verificando requisitos para SSL..."
    echo ""
    
    dns_ok=true
    port_ok=true
    
    if ! check_dns; then
        dns_ok=false
    fi
    
    echo ""
    
    if ! check_port_80; then
        port_ok=false
    fi
    
    echo ""
    check_external_access
    
    echo ""
    echo "📊 RESUMEN DE VERIFICACIÓN"
    echo "========================="
    
    if [ "$dns_ok" = true ]; then
        echo "✅ DNS configurado correctamente"
    else
        echo "❌ DNS necesita configuración"
    fi
    
    if [ "$port_ok" = true ]; then
        echo "✅ Puerto 80 disponible localmente"
    else
        echo "❌ Puerto 80 no disponible"
    fi
    
    if [ "$dns_ok" = true ] && [ "$port_ok" = true ]; then
        echo ""
        echo "🎯 SIGUIENTE PASO: Configura port forwarding en el router"
        show_router_config
        echo ""
        echo "🔄 Después ejecuta: sudo ./setup-ssl-nodejs.sh"
    else
        echo ""
        echo "⚠️  HAY PROBLEMAS QUE RESOLVER ANTES DE CONTINUAR"
        show_router_config
        show_alternatives
    fi
}

# Ejecutar función principal
main 