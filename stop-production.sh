#!/bin/bash

# Script para detener la aplicación en modo producción
echo "🛑 Deteniendo Comparativa de Vehículos"
echo "======================================"

# Función para detener un proceso por PID
stop_process() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "🔄 Deteniendo $service_name (PID: $pid)..."
            kill "$pid"
            sleep 2
            
            # Verificar si el proceso sigue corriendo
            if ps -p "$pid" > /dev/null 2>&1; then
                echo "⚠️  Forzando cierre de $service_name..."
                kill -9 "$pid"
                sleep 1
            fi
            
            if ! ps -p "$pid" > /dev/null 2>&1; then
                echo "✅ $service_name detenido correctamente"
            else
                echo "❌ No se pudo detener $service_name"
            fi
        else
            echo "⚠️  $service_name ya estaba detenido"
        fi
        rm -f "$pid_file"
    else
        echo "⚠️  No se encontró archivo PID para $service_name"
    fi
}

# Función para detener procesos por puerto
stop_by_port() {
    local port=$1
    local service_name=$2
    
    echo "🔍 Buscando procesos en puerto $port..."
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "🔄 Deteniendo $service_name en puerto $port..."
        echo "$pids" | xargs kill 2>/dev/null
        sleep 2
        
        # Verificar si quedan procesos
        local remaining_pids=$(lsof -ti:$port 2>/dev/null)
        if [ -n "$remaining_pids" ]; then
            echo "⚠️  Forzando cierre en puerto $port..."
            echo "$remaining_pids" | xargs kill -9 2>/dev/null
        fi
        
        # Verificación final
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "✅ Puerto $port liberado"
        else
            echo "❌ Puerto $port sigue ocupado"
        fi
    else
        echo "ℹ️  No hay procesos en puerto $port"
    fi
}

# Detener backend
echo "🖥️  Deteniendo backend..."
stop_process "comparativa-backend/backend.pid" "Backend"
stop_by_port 4000 "Backend"

# Detener frontend
echo "🌐 Deteniendo frontend..."
stop_process "frontend.pid" "Frontend"
stop_by_port 3000 "Frontend"

# Limpiar archivos de logs si existen
echo "🧹 Limpiando archivos temporales..."
[ -f "comparativa-backend/backend.log" ] && rm -f "comparativa-backend/backend.log"
[ -f "frontend.log" ] && rm -f "frontend.log"

# Verificación final
echo ""
echo "🔍 Verificación final..."
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && ! lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Aplicación detenida completamente"
    echo "   Puerto 3000: ✅ Libre"
    echo "   Puerto 4000: ✅ Libre"
else
    echo "⚠️  Algunos puertos pueden seguir ocupados:"
    lsof -Pi :3000 -sTCP:LISTEN 2>/dev/null | grep -v PID
    lsof -Pi :4000 -sTCP:LISTEN 2>/dev/null | grep -v PID
fi

echo ""
echo "🎯 Para reiniciar la aplicación usa: ./start-production.sh" 