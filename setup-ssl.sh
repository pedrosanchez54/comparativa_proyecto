#!/bin/bash

# Script para configurar SSL/TLS en Node.js
echo "🔒 Configurando SSL/TLS para Node.js"
echo "===================================="

# Función para verificar si se ejecuta como root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo "❌ Este script debe ejecutarse como root"
        exit 1
    fi
}

# Función para instalar Certbot
install_certbot() {
    echo "📦 Instalando Certbot..."
    apt-get update
    apt-get install -y certbot
    echo "✅ Certbot instalado"
}

# Función para crear directorio SSL
create_ssl_dir() {
    echo "📁 Creando directorio para certificados SSL..."
    mkdir -p /opt/comparativa/ssl
    chmod 700 /opt/comparativa/ssl
    echo "✅ Directorio SSL creado"
}

# Función para obtener certificado SSL
get_ssl_certificate() {
    echo "🔑 Obteniendo certificado SSL..."
    certbot certonly --standalone \
        -d proyectocomparativa.ddns.net \
        --agree-tos \
        --email pedro.sanchez.comparativa@gmail.com \
        --non-interactive

    if [ $? -eq 0 ]; then
        echo "✅ Certificado SSL obtenido"
        # Copiar certificados al directorio de la aplicación
        cp /etc/letsencrypt/live/proyectocomparativa.ddns.net/fullchain.pem /opt/comparativa/ssl/
        cp /etc/letsencrypt/live/proyectocomparativa.ddns.net/privkey.pem /opt/comparativa/ssl/
        chmod 600 /opt/comparativa/ssl/*.pem
    else
        echo "❌ Error al obtener certificado SSL"
        exit 1
    fi
}

# Función para configurar renovación automática
setup_auto_renewal() {
    echo "🔄 Configurando renovación automática..."
    
    # Crear script de renovación
    cat > /usr/local/bin/renew-ssl-nodejs.sh << 'EOF'
#!/bin/bash

# Renovar certificados
certbot renew

# Copiar nuevos certificados
cp /etc/letsencrypt/live/proyectocomparativa.ddns.net/fullchain.pem /opt/comparativa/ssl/
cp /etc/letsencrypt/live/proyectocomparativa.ddns.net/privkey.pem /opt/comparativa/ssl/
chmod 600 /opt/comparativa/ssl/*.pem

# Reiniciar servicios Node.js
systemctl restart comparativa-frontend
systemctl restart comparativa-backend
EOF

    chmod +x /usr/local/bin/renew-ssl-nodejs.sh

    # Añadir tarea cron para renovación
    (crontab -l 2>/dev/null; echo "0 0 * * * /usr/local/bin/renew-ssl-nodejs.sh") | crontab -
    echo "✅ Renovación automática configurada"
}

# Función para configurar firewall
configure_firewall() {
    echo "🛡️ Configurando firewall..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    ufw allow 4000/tcp
    echo "✅ Firewall configurado"
}

# Función para mostrar información post-instalación
show_post_install_info() {
    echo ""
    echo "🎉 Configuración SSL/TLS completada"
    echo "=================================="
    echo "📋 Certificados instalados en:"
    echo "   /opt/comparativa/ssl/fullchain.pem"
    echo "   /opt/comparativa/ssl/privkey.pem"
    echo ""
    echo "🔄 Renovación automática configurada"
    echo "   Script: /usr/local/bin/renew-ssl-nodejs.sh"
    echo "   Cron: 0 0 * * *"
    echo ""
    echo "🔒 Puertos abiertos:"
    echo "   80 (HTTP - redirección)"
    echo "   443 (HTTPS)"
    echo "   3000 (Frontend)"
    echo "   4000 (Backend)"
    echo ""
    echo "✅ La aplicación está lista para usar HTTPS"
}

# Función principal
main() {
    echo "🚀 Iniciando configuración SSL/TLS..."
    
    check_root
    install_certbot
    create_ssl_dir
    get_ssl_certificate
    setup_auto_renewal
    configure_firewall
    show_post_install_info
}

# Verificar que estamos en el directorio correcto
if [ ! -f "start-production.sh" ]; then
    echo "❌ Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Ejecutar función principal
main 