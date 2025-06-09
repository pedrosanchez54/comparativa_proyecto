#!/bin/bash

# Script para configurar el sistema de correo de Comparativa Vehículos
# Autor: Sistema de Configuración Automática
# Fecha: $(date)

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
print_message() {
    echo -e "${2}${1}${NC}"
}

print_header() {
    echo -e "\n${PURPLE}🚗 === CONFIGURACIÓN DE CORREO - COMPARATIVA VEHÍCULOS ===${NC}\n"
}

print_success() {
    print_message "$1" "$GREEN"
}

print_error() {
    print_message "$1" "$RED"
}

print_warning() {
    print_message "$1" "$YELLOW"
}

print_info() {
    print_message "$1" "$BLUE"
}

# Función para hacer backup del .env
backup_env() {
    if [ -f "comparativa-backend/.env" ]; then
        cp comparativa-backend/.env "comparativa-backend/.env.backup.$(date +%Y%m%d_%H%M%S)"
        print_success "✅ Backup del .env creado"
    fi
}

# Función para configurar Gmail SMTP
configure_gmail() {
    print_info "📧 Configurando Gmail SMTP..."
    
    read -p "📧 Email de Gmail: " gmail_user
    read -s -p "🔑 App Password de Gmail: " gmail_pass
    echo
    read -p "📤 Email remitente (Enter para usar el mismo): " mail_from
    
    if [ -z "$mail_from" ]; then
        mail_from="Comparativa Vehículos <$gmail_user>"
    fi
    
    # Actualizar .env
    sed -i "s|MAIL_HOST=.*|MAIL_HOST=smtp.gmail.com|g" comparativa-backend/.env
    sed -i "s|MAIL_PORT=.*|MAIL_PORT=587|g" comparativa-backend/.env
    sed -i "s|MAIL_USER=.*|MAIL_USER=$gmail_user|g" comparativa-backend/.env
    sed -i "s|MAIL_PASS=.*|MAIL_PASS=$gmail_pass|g" comparativa-backend/.env
    sed -i "s|MAIL_FROM=.*|MAIL_FROM=$mail_from|g" comparativa-backend/.env
    
    print_success "✅ Gmail SMTP configurado"
    print_warning "⚠️  Asegúrate de haber habilitado la verificación en 2 pasos y generado un App Password"
}

# Función para configurar Postfix local
configure_postfix() {
    print_info "🏠 Configurando Postfix local..."
    
    # Verificar si Postfix está instalado
    if ! command -v postfix &> /dev/null; then
        print_error "❌ Postfix no está instalado"
        read -p "¿Quieres instalarlo? (y/n): " install_postfix
        if [ "$install_postfix" = "y" ]; then
            sudo apt update
            sudo apt install -y postfix
            print_success "✅ Postfix instalado"
        else
            return 1
        fi
    fi
    
    # Verificar estado de Postfix
    if ! systemctl is-active --quiet postfix; then
        print_warning "⚠️  Postfix no está activo, iniciándolo..."
        sudo systemctl start postfix
        sudo systemctl enable postfix
    fi
    
    local hostname=$(hostname -f)
    local mail_from="noreply@$hostname"
    
    read -p "📤 Email remitente (Enter para $mail_from): " custom_from
    if [ ! -z "$custom_from" ]; then
        mail_from="$custom_from"
    fi
    
    # Actualizar .env
    sed -i "s|MAIL_HOST=.*|MAIL_HOST=localhost|g" comparativa-backend/.env
    sed -i "s|MAIL_PORT=.*|MAIL_PORT=25|g" comparativa-backend/.env
    sed -i "s|MAIL_USER=.*|MAIL_USER=|g" comparativa-backend/.env
    sed -i "s|MAIL_PASS=.*|MAIL_PASS=|g" comparativa-backend/.env
    sed -i "s|MAIL_FROM=.*|MAIL_FROM=$mail_from|g" comparativa-backend/.env
    
    print_success "✅ Postfix local configurado"
    print_info "ℹ️  Los emails se enviarán desde el servidor local"
}

# Función para configurar Mailtrap
configure_mailtrap() {
    print_info "🧪 Configurando Mailtrap (desarrollo)..."
    
    read -p "👤 Usuario de Mailtrap: " mailtrap_user
    read -s -p "🔑 Contraseña de Mailtrap: " mailtrap_pass
    echo
    
    # Actualizar .env
    sed -i "s|MAIL_HOST=.*|MAIL_HOST=smtp.mailtrap.io|g" comparativa-backend/.env
    sed -i "s|MAIL_PORT=.*|MAIL_PORT=2525|g" comparativa-backend/.env
    sed -i "s|MAIL_USER=.*|MAIL_USER=$mailtrap_user|g" comparativa-backend/.env
    sed -i "s|MAIL_PASS=.*|MAIL_PASS=$mailtrap_pass|g" comparativa-backend/.env
    sed -i "s|MAIL_FROM=.*|MAIL_FROM=noreply@comparativa-vehiculos.com|g" comparativa-backend/.env
    
    print_success "✅ Mailtrap configurado"
    print_info "ℹ️  Los emails aparecerán en tu bandeja de Mailtrap"
}

# Función para crear correos corporativos
create_corporate_emails() {
    print_info "🏢 Configuración de correos corporativos..."
    
    local domain="proyectocomparativa.ddns.net"
    
    print_info "📋 Sugerencias de correos corporativos para $domain:"
    echo "   • noreply@$domain (para emails automáticos)"
    echo "   • soporte@$domain (para atención al cliente)"
    echo "   • admin@$domain (para administración)"
    echo "   • info@$domain (para información general)"
    echo "   • contacto@$domain (para contacto)"
    
    print_warning "⚠️  Para usar correos corporativos necesitas:"
    echo "   1. Configurar registros MX en tu DNS"
    echo "   2. Configurar Postfix para el dominio"
    echo "   3. O usar un servicio de correo externo"
    
    read -p "¿Quieres configurar Postfix para correos corporativos? (y/n): " setup_corporate
    
    if [ "$setup_corporate" = "y" ]; then
        print_info "🔧 Configurando Postfix para correos corporativos..."
        
        # Backup de configuración actual
        sudo cp /etc/postfix/main.cf /etc/postfix/main.cf.backup.$(date +%Y%m%d_%H%M%S)
        
        # Configurar dominio
        sudo postconf -e "mydomain = $domain"
        sudo postconf -e "myhostname = mail.$domain"
        sudo postconf -e "mydestination = \$myhostname, localhost.\$mydomain, localhost, \$mydomain"
        sudo postconf -e "inet_interfaces = all"
        
        # Reiniciar Postfix
        sudo systemctl restart postfix
        
        print_success "✅ Postfix configurado para correos corporativos"
        print_warning "⚠️  Recuerda configurar los registros DNS MX"
    fi
}

# Función para probar la configuración
test_configuration() {
    print_info "🧪 Probando configuración de correo..."
    
    cd comparativa-backend
    
    if [ ! -f "test-email.js" ]; then
        print_error "❌ Script de prueba no encontrado"
        return 1
    fi
    
    read -p "📧 Email para prueba: " test_email
    
    if [ ! -z "$test_email" ]; then
        print_info "📤 Ejecutando prueba..."
        node test-email.js "$test_email"
    fi
    
    cd ..
}

# Función para mostrar el estado actual
show_current_config() {
    print_info "📋 Configuración actual:"
    
    if [ -f "comparativa-backend/.env" ]; then
        echo "   MAIL_HOST: $(grep MAIL_HOST comparativa-backend/.env | cut -d'=' -f2)"
        echo "   MAIL_PORT: $(grep MAIL_PORT comparativa-backend/.env | cut -d'=' -f2)"
        echo "   MAIL_USER: $(grep MAIL_USER comparativa-backend/.env | cut -d'=' -f2)"
        echo "   MAIL_FROM: $(grep MAIL_FROM comparativa-backend/.env | cut -d'=' -f2)"
    else
        print_error "❌ Archivo .env no encontrado"
    fi
}

# Función principal
main() {
    print_header
    
    # Verificar que estamos en el directorio correcto
    if [ ! -d "comparativa-backend" ]; then
        print_error "❌ Este script debe ejecutarse desde el directorio raíz del proyecto"
        exit 1
    fi
    
    # Mostrar configuración actual
    show_current_config
    
    echo
    print_info "📋 Opciones de configuración:"
    echo "   1. Gmail SMTP (recomendado para producción)"
    echo "   2. Postfix Local (para desarrollo/servidor propio)"
    echo "   3. Mailtrap (para desarrollo/testing)"
    echo "   4. Configurar correos corporativos"
    echo "   5. Probar configuración actual"
    echo "   6. Mostrar configuración actual"
    echo "   0. Salir"
    
    read -p "👉 Selecciona una opción: " option
    
    case $option in
        1)
            backup_env
            configure_gmail
            ;;
        2)
            backup_env
            configure_postfix
            ;;
        3)
            backup_env
            configure_mailtrap
            ;;
        4)
            create_corporate_emails
            ;;
        5)
            test_configuration
            ;;
        6)
            show_current_config
            ;;
        0)
            print_success "👋 ¡Hasta luego!"
            exit 0
            ;;
        *)
            print_error "❌ Opción no válida"
            exit 1
            ;;
    esac
    
    echo
    print_success "✅ Configuración completada"
    print_info "💡 Puedes probar la configuración ejecutando: cd comparativa-backend && node test-email.js"
}

# Ejecutar función principal
main "$@" 