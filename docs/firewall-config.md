# Configuración del Firewall para Comparativa de Vehículos

Este documento describe la configuración del firewall implementada para proteger el servidor mientras se permite el acceso a la aplicación web.

## Puertos utilizados por la aplicación

| Puerto | Protocolo | Servicio | Acceso | Descripción |
|--------|-----------|----------|--------|-------------|
| 3000   | TCP       | Frontend HTTPS | Externo e interno | Servidor frontend de la aplicación |
| 4000   | TCP       | Backend HTTPS/API | Externo e interno | Servidor backend/API |
| 80     | TCP       | HTTP | Externo e interno | Tráfico web estándar |
| 443    | TCP       | HTTPS | Externo e interno | Tráfico web seguro |
| 3306   | TCP       | MySQL | Solo local (127.0.0.1) | Base de datos |
| 631    | TCP       | CUPS | Solo local (127.0.0.1) | Servicio de impresión |
| 53     | TCP/UDP   | DNS | Solo local (127.0.0.1) | Resolución de nombres |
| 22     | TCP       | SSH | Externo e interno (limitado) | Administración remota |

## Medidas de seguridad implementadas

1. **Política por defecto restrictiva**: 
   - Todo el tráfico entrante está denegado por defecto
   - Solo se permite el tráfico explícitamente autorizado

2. **Protección contra ataques de fuerza bruta**:
   - El puerto SSH (22) está configurado con la opción `limit`, que restringe las conexiones repetidas
   - Esta protección detecta intentos de ataque y bloquea temporalmente las IPs sospechosas

3. **Aislamiento de servicios internos**:
   - MySQL, CUPS y otros servicios del sistema solo aceptan conexiones locales
   - No hay exposición innecesaria de servicios a internet

4. **Registro de actividad**:
   - Logging activado para todas las reglas del firewall
   - Facilita la detección de intentos de intrusión

## Scripts de configuración

Se incluyen varios scripts para gestionar el firewall:

### 1. setup-firewall.sh

Este script configura el firewall UFW con las reglas necesarias para permitir el funcionamiento de la aplicación:

```bash
sudo ./setup-firewall.sh
```

Acciones que realiza:
- Establece política por defecto: denegar tráfico entrante, permitir tráfico saliente
- Permite acceso SSH (puerto 22) con protección contra ataques de fuerza bruta
- Permite acceso al frontend (puerto 3000)
- Permite acceso al backend/API (puerto 4000)
- Permite tráfico HTTP/HTTPS estándar (puertos 80 y 443)
- Restringe el acceso a servicios internos (MySQL, CUPS, DNS) solo desde localhost

### 2. disable-firewall.sh

Script de emergencia para desactivar completamente el firewall:

```bash
sudo ./disable-firewall.sh
```

Útil en caso de pérdida de acceso debido a una configuración incorrecta.

### 3. Integración con start-production-https.sh

El script principal de inicio de la aplicación ahora incluye:
- Opción para configurar el firewall durante el arranque
- Información sobre el estado del firewall al final del proceso de inicio

## Verificación del firewall

Para comprobar el estado actual del firewall:

```bash
sudo ufw status
```

Para una información más detallada:

```bash
sudo ufw status verbose
```

Para ver las reglas con números (útil para eliminar reglas específicas):

```bash
sudo ufw status numbered
```

## Administración del firewall

### Añadir una nueva regla

```bash
sudo ufw allow <puerto>/tcp
```

### Eliminar una regla existente

Primero listar las reglas con números:
```bash
sudo ufw status numbered
```

Luego eliminar por número:
```bash
sudo ufw delete <número>
```

### Permitir acceso desde una IP específica

```bash
sudo ufw allow from <dirección-ip>
```

### Permitir acceso a un puerto desde una IP específica

```bash
sudo ufw allow from <dirección-ip> to any port <puerto>
```

### Limitar conexiones a un servicio (protección contra fuerza bruta)

```bash
sudo ufw limit <servicio/puerto>
```

## Monitorización de seguridad

Los logs del firewall se encuentran en:
```
/var/log/ufw.log
```

Para monitorizar intentos de acceso en tiempo real:
```bash
sudo tail -f /var/log/ufw.log
```

## Precauciones

1. **SIEMPRE** mantenga el puerto SSH (22) abierto para evitar perder acceso al servidor.
2. Si pierde acceso, deberá iniciar sesión físicamente o a través de la consola del proveedor y ejecutar `sudo ufw disable`.
3. Realice pruebas de conectividad tras cada cambio en la configuración del firewall.
4. Considere añadir su dirección IP a una lista blanca si necesita acceso administrativo frecuente:
   ```bash
   sudo ufw allow from <tu-ip-fija>
   ```
5. Actualice periódicamente las reglas del firewall conforme evolucionen las necesidades de la aplicación. 