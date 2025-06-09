# 🚗 Comparativa de Vehículos - Proyecto Final

> **Aplicación Web Completa para Comparación de Vehículos | Proyecto 100% Funcional**

## 🌟 **Estado del Proyecto: COMPLETADO ✅**

**Última actualización:** Enero 2025  
**Estado:** Producción - Totalmente funcional  
**URL:** https://proyectocomparativa.ddns.net:3000

---

## 📋 **Resumen del Proyecto**

Aplicación web moderna para la **comparación detallada de vehículos** con arquitectura full-stack:
- **Frontend:** React.js con diseño responsive  
- **Backend:** Node.js + Express + MySQL
- **Seguridad:** HTTPS nativo con certificados SSL Let's Encrypt
- **Despliegue:** DDNS + servidores Node.js nativos

---

## 🚀 **Funcionalidades Implementadas**

### ✅ **Sistema Core**
- 🔐 **Autenticación completa** (registro, login, reseteo de contraseña)
- 🚗 **Catálogo de vehículos** con filtros avanzados y paginación responsive
- 🔍 **Comparativas dinámicas** hasta 6 vehículos simultáneamente
- 💾 **Gestión de favoritos** y listas personalizadas
- 🎯 **Sistema de administración** completo para gestión de datos

### ✅ **Características Técnicas**
- 📱 **Diseño responsive** optimizado para móviles (< 460px)
- 🔒 **HTTPS nativo** sin nginx (servidores Node.js con TLS)
- 🖼️ **Sistema de imágenes** con URLs HTTPS correctas
- 📧 **Email transaccional** (reseteo de contraseñas)
- 🗄️ **Base de datos MySQL** con relaciones complejas

### ✅ **Páginas Implementadas**
- 🏠 Página principal con diseño moderno
- 📊 Catálogo con filtros y ordenación
- ⚖️ Comparativas interactivas
- 👤 Perfil de usuario y gestión de cuenta
- 💼 Panel de administración completo
- 📄 Páginas legales (términos, privacidad, contacto)

---

## 🔧 **Arquitectura Técnica**

### **Frontend (Puerto 3000)**
```
comparativa-frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas principales
│   ├── contexts/      # Estado global (Auth, Compare)
│   ├── services/      # API client (Axios)
│   └── hooks/         # Custom hooks
├── server-https.js    # Servidor HTTPS nativo
└── build/            # Producción compilada
```

### **Backend (Puerto 4000)**
```
comparativa-backend/
├── controllers/       # Lógica de negocio
├── routes/           # Rutas API REST
├── middleware/       # Auth, logging, errores
├── validation/       # Validaciones entrada
├── utils/           # JWT, email, hash
├── config/          # Configuración DB
└── server-https.js   # Servidor API HTTPS
```

---

## 🌐 **URLs de Acceso**

| **Servicio** | **URL** | **Estado** |
|--------------|---------|------------|
| **Frontend** | https://proyectocomparativa.ddns.net:3000 | ✅ Operativo |
| **Backend API** | https://proyectocomparativa.ddns.net:4000 | ✅ Operativo |
| **Documentación API** | https://proyectocomparativa.ddns.net:4000/api | ✅ Operativo |

---

## 📱 **Responsive Design**

### **Paginación Adaptativa:**
- **> 768px:** 5 páginas + "Anterior/Siguiente"
- **461-768px:** 4 páginas + texto completo  
- **381-460px:** 3 páginas + **solo iconos ← →**
- **≤ 380px:** 3 páginas + padding mínimo + scroll

### **Breakpoints Principales:**
- **Desktop:** 1200px+
- **Tablet:** 768px-1199px
- **Mobile:** < 768px
- **Mobile Small:** < 460px

---

## 🔐 **Configuración HTTPS**

### **Certificados SSL:**
- **Proveedor:** Let's Encrypt (Renovación automática)
- **Validez:** Hasta Septiembre 2025
- **Configuración:** TLS 1.2+ / HTTP/2

### **Servidores Nativos:**
- **Sin nginx:** Node.js maneja HTTPS directamente
- **Certificados:** `/opt/comparativa/ssl/`
- **Renovación:** Script automatizado

---

## 🛠️ **Scripts de Gestión**

### **Inicio/Parada:**
```bash
./start-production-https.sh    # Iniciar todo (HTTPS)
./stop-production.sh           # Detener servicios
```

### **Verificación:**
```bash
./verify-https-system.sh       # Verificar estado HTTPS
```

### **Configuración:**
```bash
./setup-ssl-nodejs.sh          # Configurar SSL
./configure-ddns.sh            # Configurar DDNS
```

---

## 🎯 **Casos de Uso Principales**

### **👤 Usuario Final:**
1. **Explorar catálogo** con filtros por marca, tipo, combustible
2. **Comparar vehículos** seleccionando hasta 6 unidades
3. **Gestionar favoritos** y crear listas personalizadas
4. **Ver detalles completos** incluyendo especificaciones y tiempos de circuito

### **🔧 Administrador:**
1. **Gestionar vehículos** (crear, editar, eliminar)
2. **Subir imágenes** y gestionar galería
3. **Moderar contenido** y gestionar usuarios
4. **Acceso completo** a todas las funcionalidades

---

## 📊 **Base de Datos**

### **Tablas Principales:**
- `Vehiculo` - Datos principales de vehículos
- `Marca`, `Modelo`, `Generacion`, `Motorizacion` - Jerarquía de clasificación
- `Usuario` - Gestión de cuentas
- `Favoritos`, `Listas` - Funcionalidades personales
- `Imagenes` - Sistema de galería
- `Tiempos_Circuito` - Datos de rendimiento

---

## 🔄 **Historial de Desarrollo**

### **Versión 3.0 (Actual) - Enero 2025:**
- ✅ **Migración HTTPS completa** con servidores nativos
- ✅ **Corrección URLs de imágenes** hardcodeadas
- ✅ **Paginación responsive** para móviles
- ✅ **Sistema de comparativas** 100% funcional
- ✅ **Documentación completa** y scripts automatizados

### **Versión 2.0 - Diciembre 2024:**
- ✅ **Páginas footer** (términos, privacidad, contacto)
- ✅ **Sistema de autenticación** completo
- ✅ **Panel de administración** avanzado
- ✅ **Responsive design** optimizado

### **Versión 1.0 - Noviembre 2024:**
- ✅ **Base de la aplicación** con funcionalidades core
- ✅ **Catálogo de vehículos** con filtros
- ✅ **Sistema de comparativas** básico
- ✅ **Integración base de datos** MySQL

---

## 📞 **Información de Contacto**

**Desarrollador:** Pedro Sánchez  
**Repositorio:** https://github.com/pedrosanchez54/comparativa_proyecto  
**Proyecto:** Trabajo Final de Curso  

---

## 📄 **Licencia**

Este proyecto es de uso académico para Trabajo Final de Curso.

---

**🎉 ¡Proyecto 100% Completado y Funcional!**
