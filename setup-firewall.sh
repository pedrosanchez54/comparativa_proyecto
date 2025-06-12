#!/bin/bash

# Script para configurar el firewall (UFW) para la aplicación Comparativa de Vehículos
echo "🔥 Configurando Firewall para Comparativa de Vehículos"
echo "======================================================"

# Verificar si se está ejecutando como root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Este script debe ejecutarse como root (con sudo)"
  exit 1
fi

# Reiniciar configuración de UFW
echo "🔄 Reiniciando configuración de UFW..."
ufw --force reset

# Establecer políticas por defecto
echo "🛡️ Estableciendo políticas por defecto..."
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH (por seguridad, para no perder acceso al servidor)
echo "🔓 Permitiendo SSH (puerto 22)..."
ufw allow ssh

# Permitir puertos de la aplicación
echo "🌐 Permitiendo puertos para la aplicación web..."
ufw allow 3000/tcp comment 'Frontend HTTPS'
ufw allow 4000/tcp comment 'Backend HTTPS/API'

# Puertos web estándar
echo "🌐 Configurando puertos web estándar (80, 443)..."
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# MySQL solo debe ser accesible localmente
echo "🔒 Configurando MySQL para acceso local solamente..."
ufw allow from 127.0.0.1 to any port 3306 comment 'MySQL local only'

# Servicios del sistema
echo "🔧 Configurando reglas para servicios del sistema..."
ufw allow from 127.0.0.1 to any port 631 comment 'CUPS printing'
ufw allow from 127.0.0.1 to any port 53 comment 'DNS local'

# Protección adicional
echo "🛡️ Configurando protección contra escaneo de puertos..."
ufw limit ssh comment 'Rate limit SSH'

# Habilitar logging
echo "📝 Habilitando registro de eventos del firewall..."
ufw logging on

# Habilitar el firewall
echo "✅ Habilitando firewall..."
ufw --force enable

# Mostrar estado actual
echo "📊 Estado actual del firewall:"
ufw status verbose

echo ""
echo "🎉 Configuración de firewall completada!"
echo "======================================"
echo "Se han abierto los siguientes puertos:"
echo "- Puerto 22: SSH (para administración, con limit para protección)"
echo "- Puerto 3000: Frontend HTTPS"
echo "- Puerto 4000: Backend HTTPS/API"
echo "- Puerto 80: HTTP"
echo "- Puerto 443: HTTPS"
echo "- Puerto 3306: MySQL (solo acceso local)"
echo "- Puerto 631: CUPS (solo acceso local)"
echo "- Puerto 53: DNS (solo acceso local)"
echo ""
echo "Para modificar esta configuración, utiliza los comandos:"
echo "- sudo ufw allow <puerto>    : Abrir un puerto"
echo "- sudo ufw deny <puerto>     : Cerrar un puerto"
echo "- sudo ufw delete <regla>    : Eliminar una regla"
echo "- sudo ufw status            : Ver estado actual"
echo "- sudo ufw disable           : Desactivar firewall"
echo ""
echo "⚠️ IMPORTANTE: Asegúrate de que puedes acceder a la aplicación"
echo "después de aplicar estas reglas. Si pierdes acceso, conéctate"
echo "directamente al servidor y ejecuta 'sudo ufw disable'." 