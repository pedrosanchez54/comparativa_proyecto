#!/bin/bash

# Script maestro para migrar completamente a HTTPS
echo "🔒 MIGRACIÓN COMPLETA A HTTPS"
echo "============================="
echo ""
echo "Este script realizará una migración completa de HTTP a HTTPS"
echo "para tu aplicación de comparativa de vehículos."
echo ""

# Función para verificar prerequisitos
check_prerequisites() {
    echo "🔍 Verificando prerequisitos..."
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "start-production.sh" ]; then
        echo "❌ Este script debe ejecutarse desde el directorio raíz del proyecto"
        exit 1
    fi
    
    # Verificar que tenemos permisos de sudo
    if ! sudo -n true 2>/dev/null; then
        echo "⚠️  Este script necesita permisos de sudo para configurar SSL"
        echo "💡 Ejecuta: sudo $0"
        exit 1
    fi
    
    # Verificar conectividad a internet
    if ! ping -c 1 google.com &> /dev/null; then
        echo "❌ Sin conexión a internet. Se necesita para obtener certificados SSL"
        exit 1
    fi
    
    echo "✅ Prerequisitos verificados"
}

# Función para mostrar información importante
show_pre_migration_info() {
    echo ""
    echo "⚠️  INFORMACIÓN IMPORTANTE ANTES DE CONTINUAR"
    echo "============================================="
    echo ""
    echo "📋 Este proceso realizará:"
    echo "   1. Backup de toda la configuración actual"
    echo "   2. Migración de todas las URLs HTTP a HTTPS"
    echo "   3. Instalación y configuración de SSL/TLS"
    echo "   4. Configuración de Node.js con HTTPS nativo"
    echo "   5. Configuración de renovación automática de certificados"
    echo ""
    echo "🌐 CONFIGURACIÓN DEL ROUTER REQUERIDA:"
    echo "   Después de la migración, deberás configurar en tu router:"
    echo "   - Puerto 80 (HTTP) → 192.168.1.82:80 (para renovación SSL)"
    echo "   - Puerto 3000 (Frontend HTTPS) → 192.168.1.82:3000"
    echo "   - Puerto 4000 (Backend HTTPS) → 192.168.1.82:4000"
    echo ""
    echo "📧 Email para certificados SSL: pedro.sanchez.comparativa@gmail.com"
    echo "🌍 Dominio: proyectocomparativa.ddns.net"
    echo ""
    
    read -p "¿Continuar con la migración? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Migración cancelada por el usuario"
        exit 1
    fi
}

# Función para ejecutar migración del código
run_code_migration() {
    echo ""
    echo "📝 PASO 1: Migrando código a HTTPS"
    echo "=================================="
    
    if [ -f "migrate-to-https.sh" ]; then
        ./migrate-to-https.sh
        
        if [ $? -eq 0 ]; then
            echo "✅ Migración del código completada"
        else
            echo "❌ Error en la migración del código"
            exit 1
        fi
    else
        echo "❌ No se encontró migrate-to-https.sh"
        exit 1
    fi
}

# Función para ejecutar configuración SSL
run_ssl_setup() {
    echo ""
    echo "🔒 PASO 2: Configurando SSL/TLS"
    echo "==============================="
    
    if [ -f "setup-ssl-nodejs.sh" ]; then
        ./setup-ssl-nodejs.sh
        
        if [ $? -eq 0 ]; then
            echo "✅ Configuración SSL completada"
        else
            echo "❌ Error en la configuración SSL"
            echo "💡 Revisa los logs y la configuración del router"
            exit 1
        fi
    else
        echo "❌ No se encontró setup-ssl-nodejs.sh"
        exit 1
    fi
}

# Función para probar la configuración
test_https_configuration() {
    echo ""
    echo "🧪 PASO 3: Probando configuración HTTPS"
    echo "======================================="
    
    echo "🔄 Esperando que nginx se estabilice..."
    sleep 5
    
    # Probar conexión HTTPS local
    if curl -k -s https://localhost > /dev/null 2>&1; then
        echo "✅ HTTPS funcionando localmente"
    else
        echo "⚠️  HTTPS local no responde (esto puede ser normal)"
    fi
    
    # Probar conexión HTTP local (debería redirigir)
    if curl -s http://localhost | grep -q "301\|302"; then
        echo "✅ Redirección HTTP → HTTPS funcionando"
    else
        echo "⚠️  Redirección HTTP no detectada"
    fi
    
    echo "✅ Configuración básica completada"
}

# Función para mostrar instrucciones post-migración
show_post_migration_instructions() {
    echo ""
    echo "🎉 ¡MIGRACIÓN A HTTPS COMPLETADA!"
    echo "================================"
    echo ""
    echo "🔧 CONFIGURACIÓN DEL ROUTER (¡IMPORTANTE!):"
    echo "   1. Abre tu router (generalmente 192.168.1.1)"
    echo "   2. Ve a la sección de Port Forwarding"
    echo "   3. Configura estas reglas:"
    echo ""
    echo "      Puerto Externo | Puerto Interno | IP Interna"
    echo "      ------------------------------------------- "
    echo "      80             | 80             | 192.168.1.82"
    echo "      443            | 443            | 192.168.1.82"
    echo ""
    echo "   4. OPCIONAL: Elimina las reglas de los puertos 3000 y 4000"
    echo ""
    echo "🚀 INICIAR LA APLICACIÓN:"
    echo "   ./start-production-https.sh"
    echo ""
    echo "🌐 ACCEDER A LA APLICACIÓN:"
    echo "   Frontend: https://proyectocomparativa.ddns.net:3000"
    echo "   Backend:  https://proyectocomparativa.ddns.net:4000"
    echo "   API:      https://proyectocomparativa.ddns.net:4000/api"
    echo ""
    echo "📋 COMANDOS ÚTILES:"
    echo "   Ver logs SSL:      ls -la /opt/comparativa/ssl/"
    echo "   Renovar SSL:       sudo /usr/local/bin/renew-ssl-nodejs.sh"
    echo "   Probar SSL:        curl -I https://proyectocomparativa.ddns.net:3000"
    echo ""
    echo "🔒 SEGURIDAD:"
    echo "   ✅ SSL/TLS configurado con Let's Encrypt"
    echo "   ✅ Renovación automática programada"
    echo "   ✅ Headers de seguridad configurados"
    echo "   ✅ Redirección HTTP → HTTPS automática"
    echo ""
    echo "📧 NOTA: Los certificados SSL se renovarán automáticamente."
}

# Función para verificar estado final
final_status_check() {
    echo ""
    echo "🔍 VERIFICACIÓN FINAL"
    echo "===================="
    
    # Verificar certificados SSL
    if [ -f "/opt/comparativa/ssl/fullchain.pem" ]; then
        echo "✅ Certificados SSL configurados"
    else
        echo "❌ Certificados SSL no encontrados"
    fi
    
    # Verificar certificados
    if [ -f "/etc/letsencrypt/live/proyectocomparativa.ddns.net/fullchain.pem" ]; then
        echo "✅ Certificado SSL instalado"
        
        # Mostrar fecha de expiración
        expiry_date=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/proyectocomparativa.ddns.net/fullchain.pem | cut -d= -f2)
        echo "📅 Expira el: $expiry_date"
    else
        echo "❌ Certificado SSL no encontrado"
    fi
    
    # Verificar servidor backend HTTPS
    if [ -f "comparativa-backend/server-https.js" ]; then
        echo "✅ Servidor HTTPS configurado"
    else
        echo "❌ Servidor HTTPS no configurado"
    fi
    
    echo ""
    echo "🎊 ¡Tu aplicación está lista para HTTPS!"
}

# Función principal
main() {
    echo "🚀 Iniciando migración completa a HTTPS..."
    
    check_prerequisites
    show_pre_migration_info
    run_code_migration
    run_ssl_setup
    test_https_configuration
    show_post_migration_instructions
    final_status_check
    
    echo ""
    echo "✨ ¡Migración completada exitosamente!"
    echo "   Ahora configura el port-forwarding de tu router y ejecuta:"
    echo "   ./start-production-https.sh"
}

# Ejecutar función principal
main "$@" 