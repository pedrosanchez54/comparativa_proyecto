#!/bin/bash

# Script de emergencia para desactivar el firewall
echo "🚨 SCRIPT DE EMERGENCIA - DESACTIVACIÓN DEL FIREWALL 🚨"
echo "====================================================="
echo "Este script desactiva el firewall completamente en caso de emergencia"
echo "(por ejemplo, si pierdes acceso al servidor tras configurar el firewall)"

# Verificar si se está ejecutando como root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Este script debe ejecutarse como root (con sudo)"
  exit 1
fi

echo "🔄 Desactivando firewall (UFW)..."
ufw disable

echo "📊 Verificando estado del firewall:"
ufw status

echo ""
echo "✅ El firewall ha sido desactivado completamente."
echo "Si necesitas reactivarlo con la configuración para la aplicación, ejecuta:"
echo "sudo ./setup-firewall.sh" 