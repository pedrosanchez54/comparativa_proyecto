#!/bin/bash

# Script para configurar SSL/TLS usando validación DNS manual
echo "🔒 Configurando SSL/TLS con Validación DNS"
echo "=========================================="

# Función para verificar si el script se ejecuta como root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo "❌ Este script debe ejecutarse como root (sudo)"
        exit 1
    fi
}

# Función para instalar Certbot
install_certbot() {
    echo "📦 Verificando Certbot..."
    
    if ! command -v certbot &> /dev/null; then
        echo "📦 Instalando Certbot..."
        apt update
        
        if ! command -v snap &> /dev/null; then
            apt install snapd -y
            systemctl enable snapd
            systemctl start snapd
        fi
        
        snap install core; snap refresh core
        snap install --classic certbot
        ln -sf /snap/bin/certbot /usr/bin/certbot
    fi
    
    echo "✅ Certbot disponible"
}

# Función para obtener certificado con validación DNS manual
get_ssl_certificate_dns() {
    echo "🔒 Obteniendo certificado SSL con validación DNS..."
    echo ""
    echo "⚠️  ATENCIÓN: Este proceso requiere intervención manual"
    echo ""
    
    # Intentar obtener certificado con validación DNS manual
    certbot certonly --manual \
        --preferred-challenges dns \
        --email pedro.sanchez.comparativa@gmail.com \
        --agree-tos \
        -d proyectocomparativa.ddns.net
    
    if [ $? -eq 0 ]; then
        echo "✅ Certificado SSL obtenido correctamente"
        return 0
    else
        echo "❌ Error al obtener el certificado SSL"
        return 1
    fi
}

# Función para configurar directorios SSL
setup_ssl_directory() {
    echo "📁 Configurando directorio SSL para Node.js..."
    
    if [ ! -f "/etc/letsencrypt/live/proyectocomparativa.ddns.net/fullchain.pem" ]; then
        echo "❌ Certificados no encontrados"
        return 1
    fi
    
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
    cd /home/pedro/comparativa_proyecto
    ln -sf /opt/comparativa/ssl ./ssl
    
    echo "✅ Certificados configurados para Node.js"
}

# Función para configurar renovación automática
setup_auto_renewal() {
    echo "🔄 Configurando renovación automática..."
    
    # Crear script de renovación que actualiza los certificados de Node.js
    cat > /usr/local/bin/renew-ssl-dns.sh << 'EOF'
#!/bin/bash
# Renovar certificados (requerirá intervención manual)
certbot renew --manual

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
    
    chmod +x /usr/local/bin/renew-ssl-dns.sh
    
    echo "✅ Script de renovación creado en /usr/local/bin/renew-ssl-dns.sh"
    echo "⚠️  NOTA: La renovación DNS requerirá intervención manual cada 90 días"
}

# Función para mostrar información post-instalación
show_post_install_info() {
    echo ""
    echo "🎉 ¡SSL/TLS configurado con validación DNS!"
    echo "=========================================="
    echo ""
    echo "🔒 Tu aplicación estará disponible en:"
    echo "   Frontend: https://proyectocomparativa.ddns.net:3000"
    echo "   Backend:  https://proyectocomparativa.ddns.net:4000"
    echo ""
    echo "🔧 Próximos pasos:"
    echo "   1. Actualizar todas las URLs en el código: ./migrate-to-https.sh"
    echo "   2. Ejecutar: ./start-production-https.sh"
    echo "   3. Probar el acceso HTTPS"
    echo ""
    echo "📋 Comandos útiles:"
    echo "   Ver certificados: ls -la /opt/comparativa/ssl/"
    echo "   Renovar SSL:      sudo /usr/local/bin/renew-ssl-dns.sh"
    echo "   Ver logs:         tail -f comparativa-backend/backend.log"
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "   - Los certificados se renuevan cada 90 días"
    echo "   - La renovación requerirá configurar DNS manualmente"
    echo "   - Recibirás emails de aviso antes del vencimiento"
}

# Función principal
main() {
    echo "🚀 Iniciando configuración SSL/TLS con DNS..."
    
    check_root
    install_certbot
    
    echo ""
    echo "🔄 Intentando obtener certificado SSL..."
    
    if get_ssl_certificate_dns; then
        setup_ssl_directory
        setup_auto_renewal
        show_post_install_info
    else
        echo ""
        echo "❌ No se pudo obtener el certificado SSL"
        echo "💡 Alternativas:"
        echo "   1. Usar certificados self-signed: ./setup-frontend-https.sh"
        echo "   2. Revisar configuración del router"
        echo "   3. Contactar a tu ISP sobre bloqueo de puertos"
        exit 1
    fi
}

# Verificar que estamos en el directorio correcto
if [ ! -f "/home/pedro/comparativa_proyecto/start-production.sh" ]; then
    echo "❌ Directorio del proyecto no encontrado"
    exit 1
fi

# Ejecutar función principal
main 