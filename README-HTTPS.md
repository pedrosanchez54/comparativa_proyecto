# 🔒 Guía de Migración a HTTPS

Esta guía explica cómo migrar tu aplicación de comparativa de vehículos de HTTP a HTTPS usando SSL/TLS con Let's Encrypt.

## 📋 Resumen de la Migración

La migración incluye:
- ✅ Configuración SSL/TLS con Let's Encrypt
- ✅ Nginx como proxy reverso
- ✅ Renovación automática de certificados
- ✅ Redirección automática HTTP → HTTPS
- ✅ Headers de seguridad configurados
- ✅ Actualización de todas las URLs en el código

## 🚀 Migración Automática (Recomendado)

### Paso 1: Ejecutar la migración completa
```bash
sudo ./deploy-https.sh
```

Este script realizará automáticamente:
1. Backup de la configuración actual
2. Migración del código HTTP → HTTPS
3. Instalación y configuración de SSL
4. Configuración de nginx
5. Verificación de la configuración

### Paso 2: Configurar el router
Después de la migración, configura el port forwarding en tu router:

| Puerto Externo | Puerto Interno | IP Interna   |
|----------------|----------------|--------------|
| 80             | 80             | 192.168.1.82 |
| 443            | 443            | 192.168.1.82 |

### Paso 3: Iniciar la aplicación
```bash
./start-production-https.sh
```

### Paso 4: Acceder a la aplicación
- **Frontend**: https://proyectocomparativa.ddns.net
- **API**: https://proyectocomparativa.ddns.net/api

## 🔧 Migración Manual (Paso a Paso)

Si prefieres hacer la migración manualmente:

### 1. Migrar el código
```bash
./migrate-to-https.sh
```

### 2. Configurar SSL
```bash
sudo ./setup-ssl.sh
```

### 3. Verificar configuración
```bash
sudo systemctl status nginx
sudo nginx -t
```

## 📁 Archivos Creados/Modificados

### Scripts nuevos:
- `deploy-https.sh` - Script maestro de migración
- `migrate-to-https.sh` - Migración del código
- `setup-ssl.sh` - Configuración SSL/TLS
- `start-production-https.sh` - Inicio con HTTPS

### Archivos modificados:
- `comparativa-backend/server.js` - CORS y configuración HTTPS
- `comparativa-backend/.env` - URLs HTTPS
- `comparativa-frontend/.env` - URLs API HTTPS
- `comparativa-frontend/src/services/api.js` - Endpoint HTTPS
- Todos los controladores del backend
- Scripts de gestión existentes
- Documentación

### Configuración nginx:
- `/etc/nginx/sites-available/comparativa` - Configuración del sitio
- `/etc/letsencrypt/` - Certificados SSL

## 🔍 Verificación Post-Migración

### Comandos útiles:
```bash
# Ver estado de nginx
sudo systemctl status nginx

# Ver logs de nginx
sudo tail -f /var/log/nginx/error.log

# Probar certificado SSL
curl -I https://proyectocomparativa.ddns.net

# Renovar certificado SSL
sudo certbot renew

# Ver fecha de expiración del certificado
sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/proyectocomparativa.ddns.net/fullchain.pem
```

### Tests de conectividad:
```bash
# Test HTTPS
curl -s https://proyectocomparativa.ddns.net

# Test redirección HTTP → HTTPS
curl -I http://proyectocomparativa.ddns.net

# Test API HTTPS
curl -s https://proyectocomparativa.ddns.net/api
```

## 🛠️ Configuración del Router

### Puertos necesarios:
- **Puerto 80 (HTTP)**: Para validación Let's Encrypt y redirección
- **Puerto 443 (HTTPS)**: Para tráfico SSL/TLS

### Configuración típica:
1. Accede a tu router (generalmente `192.168.1.1`)
2. Ve a **Advanced** → **NAT Forwarding** → **Port Forwarding**
3. Añade estas reglas:

```
Servicio: HTTP
Puerto externo: 80
IP interna: 192.168.1.82
Puerto interno: 80

Servicio: HTTPS
Puerto externo: 443
IP interna: 192.168.1.82
Puerto interno: 443
```

### Puertos opcionales a cerrar:
- Puerto 3000 (ya no necesario, nginx hace proxy)
- Puerto 4000 (ya no necesario, nginx hace proxy)

## 🔒 Seguridad Configurada

### Headers de seguridad añadidos:
- `Strict-Transport-Security` - Fuerza HTTPS
- `X-Frame-Options` - Previene clickjacking
- `X-Content-Type-Options` - Previene MIME sniffing
- `X-XSS-Protection` - Protección XSS

### Configuración SSL moderna:
- TLS 1.2 y 1.3 únicamente
- Ciphers seguros
- Configuración recomendada por Mozilla

### Renovación automática:
- Cron job configurado para renovar certificados
- Script de renovación: `/usr/local/bin/renew-ssl.sh`
- Ejecuta diariamente a las 2:30 AM

## 📊 Arquitectura Post-Migración

```
Internet → Router → nginx (80/443) → App (3000/4000)
```

### Flujo de requests:
1. **HTTP** (puerto 80) → nginx → redirección 301 a HTTPS
2. **HTTPS** (puerto 443) → nginx → proxy a localhost:3000 (frontend)
3. **API** (/api/*) → nginx → proxy a localhost:4000 (backend)

## 🚨 Solución de Problemas

### Error: "Certificate verification failed"
```bash
# Verificar que el dominio apunta a tu IP
dig proyectocomparativa.ddns.net

# Verificar que el puerto 80 está abierto
sudo netstat -tlnp | grep :80
```

### Error: "nginx: [emerg] cannot load certificate"
```bash
# Verificar certificados
sudo ls -la /etc/letsencrypt/live/proyectocomparativa.ddns.net/

# Regenerar si es necesario
sudo certbot delete --cert-name proyectocomparativa.ddns.net
sudo certbot certonly --standalone -d proyectocomparativa.ddns.net
```

### Error: "Connection refused"
```bash
# Verificar estado de nginx
sudo systemctl status nginx

# Verificar configuración
sudo nginx -t

# Reiniciar nginx
sudo systemctl restart nginx
```

### Error: "Mixed content" en el navegador
Verifica que todas las URLs internas usen HTTPS:
```bash
# Buscar URLs HTTP restantes
grep -r "http://" comparativa-frontend/src/
grep -r "http://" comparativa-backend/
```

## 📧 Contacto y Soporte

- **Email del certificado**: pedro.sanchez.comparativa@gmail.com
- **Dominio**: proyectocomparativa.ddns.net
- **Renovación**: Automática cada 90 días

## 📝 Notas Importantes

1. **Backup**: Todos los archivos originales se guardan con extensión `.backup.http`
2. **Reversión**: Para volver a HTTP, usa los archivos backup
3. **Certificados**: Se renuevan automáticamente, no requieren intervención manual
4. **Logs**: Siempre revisa los logs de nginx en caso de problemas
5. **Router**: La configuración del router es CRÍTICA para el funcionamiento

## ✅ Lista de Verificación Post-Migración

- [ ] Ejecutado `sudo ./deploy-https.sh` exitosamente
- [ ] Configurado port forwarding en el router (80, 443)
- [ ] Iniciada la aplicación con `./start-production-https.sh`
- [ ] Acceso a https://proyectocomparativa.ddns.net funciona
- [ ] API https://proyectocomparativa.ddns.net/api responde
- [ ] Redirección HTTP → HTTPS funciona
- [ ] Certificado SSL válido y no expirado
- [ ] Tests de conectividad pasados
- [ ] Logs sin errores críticos 