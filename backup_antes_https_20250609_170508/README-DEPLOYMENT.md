# 🌐 Guía de Despliegue - Comparativa de Vehículos

Esta guía te ayudará a hacer tu aplicación accesible desde internet para la presentación de tu proyecto.

## 📋 Índice
1. [Prerequisitos](#prerequisitos)
2. [Configuración DDNS](#configuración-ddns)
3. [Configuración del Router](#configuración-del-router)
4. [Configuración de la Aplicación](#configuración-de-la-aplicación)
5. [Despliegue](#despliegue)
6. [Verificación](#verificación)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Prerequisitos

### Software Requerido
- ✅ Node.js (v16 o superior)
- ✅ npm
- ✅ MySQL Server
- ✅ Git

### Verificación del Sistema
```bash
node --version
npm --version
mysql --version
```

---

## 🌍 Configuración DDNS

### Paso 1: Registrarse en No-IP (Recomendado)
1. Ve a https://www.noip.com/sign-up
2. Crea una cuenta gratuita
3. Confirma tu email
4. Ve a "Dynamic DNS" → "Create Hostname"
5. Elige un nombre como: `tu-proyecto-comparativa.ddns.net`
6. **¡ANOTA EXACTAMENTE EL NOMBRE!**

### Alternativas DDNS Gratuitas
- **DuckDNS**: https://www.duckdns.org (más simple)
- **Freenom**: https://www.freenom.com (dominios .tk, .ml)
- **Dynu**: https://www.dynu.com

---

## 🏠 Configuración del Router

### Paso 1: Acceder al Router
1. Abre un navegador web
2. Ve a `192.168.1.1` o `192.168.0.1`
3. Ingresa usuario y contraseña (normalmente `admin/admin`)

### Paso 2: Configurar DDNS
1. Busca la sección "DDNS" o "Dynamic DNS"
2. Habilita DDNS
3. Selecciona tu proveedor (No-IP, DuckDNS, etc.)
4. Ingresa:
   - **Username**: Tu usuario del servicio DDNS
   - **Password**: Tu contraseña del servicio DDNS
   - **Hostname**: El dominio que creaste (ej: `mi-proyecto.ddns.net`)
5. Guarda la configuración

### Paso 3: Configurar Port Forwarding
En la sección "Port Forwarding" o "Virtual Servers":

| Nombre | Puerto Externo | IP Interna | Puerto Interno | Protocolo |
|--------|----------------|------------|----------------|-----------|
| Frontend | 3000 | 192.168.1.82 | 3000 | TCP |
| Backend | 4000 | 192.168.1.82 | 4000 | TCP |

**⚠️ IMPORTANTE**: Asegúrate de que la IP interna sea `192.168.1.82` (tu PC actual).

---

## ⚙️ Configuración de la Aplicación

### Paso 1: Configurar DDNS Automáticamente
```bash
# Dale permisos de ejecución a los scripts
chmod +x configure-ddns.sh
chmod +x start-production.sh
chmod +x stop-production.sh

# Ejecuta el configurador
./configure-ddns.sh
```

El script te pedirá tu dominio DDNS y actualizará automáticamente:
- `comparativa-backend/.env`
- `comparativa-frontend/.env`
- `comparativa-backend/server.js`

### Paso 2: Verificar Configuración Manual (Opcional)

**Backend (.env):**
```env
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://tu-dominio.ddns.net
```

**Frontend (.env):**
```env
REACT_APP_API_URL=https://tu-dominio.ddns.net/api/api
```

---

## 🚀 Despliegue

### Opción 1: Despliegue Automático (Recomendado)
```bash
./start-production.sh
```

Este script:
- ✅ Verifica prerequisitos
- ✅ Construye el frontend para producción
- ✅ Inicia el backend en modo producción
- ✅ Sirve el frontend optimizado
- ✅ Muestra información de acceso

### Opción 2: Despliegue Manual

**Backend:**
```bash
cd comparativa-backend
npm install
NODE_ENV=production npm start &
cd ..
```

**Frontend:**
```bash
cd comparativa-frontend
npm install
npm run build
npx serve -s build -l 3000 &
cd ..
```

---

## ✅ Verificación

### Paso 1: Verificar Acceso Local
- Frontend: https://localhost:3000
- Backend: https://localhost:4000

### Paso 2: Verificar Acceso en Red Local
- Frontend: https://192.168.1.82:3000
- Backend: https://192.168.1.82:4000

### Paso 3: Verificar Acceso desde Internet
- Frontend: https://tu-dominio.ddns.net
- Backend: https://tu-dominio.ddns.net/api

### Comandos de Verificación
```bash
# Verificar puertos activos
ss -tlnp | grep :3000
ss -tlnp | grep :4000

# Verificar logs
tail -f comparativa-backend/backend.log
tail -f frontend.log

# Probar conectividad externa (desde otro dispositivo)
curl https://tu-dominio.ddns.net/api
```

---

## 🔧 Gestión de la Aplicación

### Iniciar la Aplicación
```bash
./start-production.sh
```

### Detener la Aplicación
```bash
./stop-production.sh
```

### Ver Logs en Tiempo Real
```bash
# Backend
tail -f comparativa-backend/backend.log

# Frontend
tail -f frontend.log
```

### Reiniciar Solo el Backend
```bash
cd comparativa-backend
npm restart
```

---

## 🆘 Solución de Problemas

### Problema: No puedo acceder desde internet

**Soluciones:**
1. **Verificar DDNS**: Ve a tu proveedor DDNS y confirma que tu IP pública esté actualizada
2. **Verificar Port Forwarding**: Confirma las reglas en tu router
3. **Verificar Firewall**: 
   ```bash
   sudo ufw allow 3000
   sudo ufw allow 4000
   ```
4. **Verificar IP Externa**: Ve a https://whatismyipaddress.com

### Problema: Error de CORS

**Solución**: Ejecuta nuevamente el configurador:
```bash
./configure-ddns.sh
```

### Problema: Puertos ocupados

**Solución**: 
```bash
./stop-production.sh
./start-production.sh
```

### Problema: Base de datos no conecta

**Soluciones:**
```bash
# Iniciar MySQL
sudo systemctl start mysql

# Verificar status
sudo systemctl status mysql

# Verificar usuario de BD
mysql -u comparativa_user -p
```

### Problema: Frontend no carga

**Soluciones:**
1. Verificar build:
   ```bash
   cd comparativa-frontend
   npm run build
   ```
2. Limpiar caché:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 📱 Acceso desde Móvil

Para probar desde tu móvil en la misma red:
- Conecta tu móvil al mismo WiFi
- Ve a: `https://192.168.1.82:3000`

---

## 🔐 Consideraciones de Seguridad

### Para Presentación (Temporal)
- ✅ Configuración actual es suficiente
- ✅ Acceso por HTTP está bien para demo

### Para Producción Real (Futuro)
- 🔒 Implementar HTTPS con Let's Encrypt
- 🔒 Configurar firewall más restrictivo
- 🔒 Usar variables de entorno más seguras
- 🔒 Implementar rate limiting

---

## 📞 Contacto y Soporte

Si tienes problemas durante la configuración:
1. Revisa los logs con `tail -f`
2. Ejecuta `./stop-production.sh` y luego `./start-production.sh`
3. Verifica que MySQL esté funcionando
4. Confirma la configuración de tu router

---

## 🎯 Checklist Final para la Presentación

- [ ] DDNS configurado y funcionando
- [ ] Port forwarding configurado en router
- [ ] Aplicación corriendo con `./start-production.sh`
- [ ] Acceso local funciona (192.168.1.82:3000)
- [ ] Acceso externo funciona (tu-dominio.ddns.net:3000)
- [ ] Base de datos con datos de prueba
- [ ] Backup de configuración realizado

**¡Tu aplicación estará lista para la presentación! 🎉** 