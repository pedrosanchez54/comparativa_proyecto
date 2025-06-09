#!/bin/bash

# Script para configurar Gmail SMTP para recuperación de contraseña
# Autor: Sistema de Configuración de Correo
# Propósito: Hacer funcional al 100% la recuperación de contraseña

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_header() {
    echo -e "\n${PURPLE}📧 === CONFIGURACIÓN GMAIL SMTP - COMPARATIVA VEHÍCULOS ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_info() {
    echo -e "${BLUE}$1${NC}"
}

# Función para mostrar instrucciones
show_instructions() {
    print_info "📋 INSTRUCCIONES PARA OBTENER APP PASSWORD DE GMAIL:"
    echo
    echo "1. Ve a: https://myaccount.google.com/"
    echo "2. Haz clic en 'Seguridad' (en el menú lateral)"
    echo "3. Busca 'Verificación en 2 pasos' y actívala si no la tienes"
    echo "4. Busca 'Contraseñas de aplicaciones' y haz clic"
    echo "5. Selecciona 'Correo' y 'Otro dispositivo personalizado'"
    echo "6. Ponle nombre: 'Comparativa Vehiculos'"
    echo "7. Copia la contraseña de 16 caracteres que te genere"
    echo
    print_warning "⚠️  IMPORTANTE: Usa la App Password, NO tu contraseña normal de Gmail"
    echo
}

# Función para validar email
validate_email() {
    local email=$1
    if [[ $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Función para backup
backup_env() {
    if [ -f "comparativa-backend/.env" ]; then
        cp comparativa-backend/.env "comparativa-backend/.env.backup.gmail.$(date +%Y%m%d_%H%M%S)"
        print_success "✅ Backup del .env creado"
    fi
}

# Función principal de configuración
configure_gmail_smtp() {
    print_header
    
    # Verificar directorio
    if [ ! -d "comparativa-backend" ]; then
        print_error "❌ Este script debe ejecutarse desde el directorio raíz del proyecto"
        exit 1
    fi
    
    show_instructions
    
    # Obtener email
    while true; do
        read -p "📧 Tu email de Gmail: " gmail_email
        if validate_email "$gmail_email"; then
            break
        else
            print_error "❌ Email no válido. Introduce un email correcto."
        fi
    done
    
    # Obtener App Password
    while true; do
        read -s -p "🔑 App Password de Gmail (16 caracteres): " gmail_app_password
        echo
        if [ ${#gmail_app_password} -eq 16 ]; then
            break
        else
            print_error "❌ El App Password debe tener exactamente 16 caracteres."
        fi
    done
    
    # Configurar email remitente
    read -p "📤 Nombre para el remitente (Enter para 'Comparativa Vehículos'): " sender_name
    if [ -z "$sender_name" ]; then
        sender_name="Comparativa Vehículos"
    fi
    
    mail_from="$sender_name <$gmail_email>"
    
    print_info "\n🔧 Configurando Gmail SMTP..."
    
    # Hacer backup
    backup_env
    
    # Actualizar .env
    sed -i "s|MAIL_HOST=.*|MAIL_HOST=smtp.gmail.com|g" comparativa-backend/.env
    sed -i "s|MAIL_PORT=.*|MAIL_PORT=587|g" comparativa-backend/.env
    sed -i "s|MAIL_USER=.*|MAIL_USER=$gmail_email|g" comparativa-backend/.env
    sed -i "s|MAIL_PASS=.*|MAIL_PASS=$gmail_app_password|g" comparativa-backend/.env
    sed -i "s|MAIL_FROM=.*|MAIL_FROM=$mail_from|g" comparativa-backend/.env
    
    print_success "✅ Configuración de Gmail SMTP completada"
    
    # Mostrar configuración
    print_info "\n📋 Configuración aplicada:"
    echo "   Email: $gmail_email"
    echo "   Remitente: $mail_from"
    echo "   Servidor: smtp.gmail.com:587"
    
    # Verificar configuración
    print_info "\n🧪 Verificando configuración..."
    
    cd comparativa-backend
    
    # Verificar nodemailer
    if node -e "const { verifyMailConfiguration } = require('./utils/mailerUtils'); verifyMailConfiguration().then(result => process.exit(result ? 0 : 1))"; then
        print_success "✅ Configuración verificada - El correo está funcionando"
        
        # Ofrecer prueba
        echo
        read -p "¿Quieres enviar un email de prueba? (y/n): " send_test
        if [ "$send_test" = "y" ]; then
            read -p "📧 Email de destino para la prueba: " test_email
            if validate_email "$test_email"; then
                print_info "📤 Enviando email de prueba..."
                if node -e "const { sendTestEmail } = require('./utils/mailerUtils'); sendTestEmail('$test_email').then(result => process.exit(result ? 0 : 1))"; then
                    print_success "✅ Email de prueba enviado correctamente a $test_email"
                    print_info "📧 Revisa tu bandeja de entrada (y carpeta de spam)"
                else
                    print_error "❌ Error al enviar email de prueba"
                fi
            else
                print_error "❌ Email de destino no válido"
            fi
        fi
    else
        print_error "❌ Error en la configuración. Verifica tus credenciales."
        exit 1
    fi
    
    cd ..
    
    echo
    print_success "🎉 ¡Configuración completada!"
    print_info "💡 Ahora puedes probar la recuperación de contraseña desde: http://proyectocomparativa.ddns.net:3000/"
    echo
    print_warning "📝 Comandos útiles:"
    echo "   • Probar emails: cd comparativa-backend && node test-email.js"
    echo "   • Probar recuperación completa: node test-password-reset.js"
    echo "   • Ver configuración: cat comparativa-backend/.env | grep MAIL"
}

# Ejecutar configuración
configure_gmail_smtp 