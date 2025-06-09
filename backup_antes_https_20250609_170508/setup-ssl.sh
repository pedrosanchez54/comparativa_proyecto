#!/bin/bash

# Script para configurar SSL/TLS con Let's Encrypt para proyectocomparativa.ddns.net
echo "🔒 Configurando SSL/TLS para HTTPS"
echo "=================================="

# Función para verificar si el script se ejecuta como root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo "❌ Este script debe ejecutarse como root (sudo)"
        exit 1
    fi
}

# Función para instalar Certbot
install_certbot() {
    echo "📦 Instalando Certbot..."
    
    # Actualizar paquetes
    apt update
    
    # Instalar snapd si no está instalado
    if ! command -v snap &> /dev/null; then
        apt install snapd -y
        systemctl enable snapd
        systemctl start snapd
    fi
    
    # Instalar certbot via snap (método recomendado)
    snap install core; snap refresh core
    snap install --classic certbot
    
    # Crear enlace simbólico
    ln -sf /snap/bin/certbot /usr/bin/certbot
    
    echo "✅ Certbot instalado correctamente"
}

# Función para instalar nginx
install_nginx() {
    echo "🌐 Instalando nginx..."
    apt install nginx -y
    systemctl enable nginx
    systemctl start nginx
    echo "✅ Nginx instalado y iniciado"
}

# Función para configurar nginx
configure_nginx() {
    echo "⚙️  Configurando nginx..."
    
    # Crear configuración para el sitio
    cat > /etc/nginx/sites-available/comparativa << 'EOF'
# Redirección HTTP -> HTTPS
server {
    listen 80;
    server_name proyectocomparativa.ddns.net;
    return 301 https://$server_name$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name proyectocomparativa.ddns.net;

    # Certificados SSL (se configurarán con certbot)
    ssl_certificate /etc/letsencrypt/live/proyectocomparativa.ddns.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/proyectocomparativa.ddns.net/privkey.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy al frontend (React)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy al backend API
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

    # Habilitar el sitio
    ln -sf /etc/nginx/sites-available/comparativa /etc/nginx/sites-enabled/
    
    # Deshabilitar sitio por defecto
    rm -f /etc/nginx/sites-enabled/default
    
    # Probar configuración
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Configuración de nginx correcta"
    else
        echo "❌ Error en la configuración de nginx"
        exit 1
    fi
}

# Función para obtener certificado SSL
get_ssl_certificate() {
    echo "🔒 Obteniendo certificado SSL..."
    
    # Detener nginx temporalmente para que certbot pueda usar el puerto 80
    systemctl stop nginx
    
    # Obtener certificado
    certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email pedro.sanchez.comparativa@gmail.com \
        -d proyectocomparativa.ddns.net
    
    if [ $? -eq 0 ]; then
        echo "✅ Certificado SSL obtenido correctamente"
        
        # Reiniciar nginx
        systemctl start nginx
        systemctl reload nginx
    else
        echo "❌ Error al obtener el certificado SSL"
        echo "💡 Verifica que:"
        echo "   - El dominio proyectocomparativa.ddns.net apunte a tu IP pública"
        echo "   - El puerto 80 esté abierto en tu router"
        echo "   - No haya firewall bloqueando el puerto 80"
        exit 1
    fi
}

# Función para configurar renovación automática
setup_auto_renewal() {
    echo "🔄 Configurando renovación automática..."
    
    # Crear script de renovación
    cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
EOF
    
    chmod +x /usr/local/bin/renew-ssl.sh
    
    # Añadir tarea cron para renovación automática (cada día a las 2:30 AM)
    crontab -l 2>/dev/null | grep -v "renew-ssl.sh" | crontab -
    (crontab -l 2>/dev/null; echo "30 2 * * * /usr/local/bin/renew-ssl.sh") | crontab -
    
    echo "✅ Renovación automática configurada"
}

# Función para configurar firewall
configure_firewall() {
    echo "🔥 Configurando firewall..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 22/tcp
        echo "✅ Firewall configurado"
    else
        echo "⚠️  UFW no está instalado. Asegúrate de que los puertos 80 y 443 estén abiertos"
    fi
}

# Función para mostrar información post-instalación
show_post_install_info() {
    echo ""
    echo "🎉 ¡SSL/TLS configurado correctamente!"
    echo "====================================="
    echo ""
    echo "🔒 Tu aplicación ahora está disponible en:"
    echo "   Frontend: https://proyectocomparativa.ddns.net"
    echo "   Backend:  https://proyectocomparativa.ddns.net/api"
    echo ""
    echo "⚠️  IMPORTANTE - Configuración del router:"
    echo "   1. Abre el puerto 80 (HTTP) → 192.168.1.82:80"
    echo "   2. Abre el puerto 443 (HTTPS) → 192.168.1.82:443"
    echo "   3. Mantén los puertos 3000 y 4000 cerrados (ya no son necesarios)"
    echo ""
    echo "🔧 Próximos pasos:"
    echo "   1. Actualizar todas las URLs HTTP a HTTPS en el código"
    echo "   2. Reiniciar la aplicación"
    echo "   3. Probar el acceso HTTPS"
    echo ""
    echo "📋 Comandos útiles:"
    echo "   Ver estado SSL: systemctl status nginx"
    echo "   Renovar SSL:    certbot renew"
    echo "   Ver logs:       tail -f /var/log/nginx/error.log"
}

# Función principal
main() {
    echo "🚀 Iniciando configuración SSL/TLS..."
    
    check_root
    install_certbot
    install_nginx
    configure_nginx
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