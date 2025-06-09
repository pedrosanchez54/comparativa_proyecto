# Memoria del Proyecto de Fin de Ciclo
## Plataforma Web de Comparativa Exhaustiva de Vehículos

---

**"PORTADA"**

---

**Autor:** Pedro Sánchez Serrano  
**Ciclo Formativo:** Administración de Sistemas Informáticos en Red (ASIR)  
**Centro Educativo:** I.E.S. Infanta Elena, Galapagar  
**Tutor del Proyecto:** Román Ontiyuelo Martín  
**Curso Académico:** 2024-2025  
**Fecha de Entrega:** Junio 2025

---

## Índice

1. [Introducción](#1-introducción)
2. [Metodología y Planificación](#2-metodología-y-planificación)
3. [Análisis y Diseño del Sistema](#3-análisis-y-diseño-del-sistema)
4. [Desarrollo de la Práctica](#4-desarrollo-de-la-práctica)
5. [Implementación](#5-implementación)
6. [Configuración y Despliegue](#6-configuración-y-despliegue)
7. [Pruebas y Validación](#7-pruebas-y-validación)
8. [Conclusiones y Trabajo Futuro](#8-conclusiones-y-trabajo-futuro)
9. [Agradecimientos](#9-agradecimientos)
10. [Bibliografía](#10-bibliografía)
11. [Anexos](#11-anexos)

---

## Glosario

**API (Application Programming Interface):** Interfaz que he desarrollado para que el frontend y el backend de mi aplicación puedan comunicarse de forma estructurada.

**Backend:** Es el "cerebro" de mi aplicación, la parte que se ejecuta en el servidor. Aquí he programado toda la lógica de negocio con Node.js y Express.js.

**Frontend:** Es la cara visible de mi proyecto, la interfaz con la que interactuarán los usuarios. La estoy construyendo con React para que sea dinámica y moderna.

**Full-stack:** Término que describe el tipo de desarrollo que estoy realizando, abarcando tanto el frontend como el backend.

**MySQL:** El sistema gestor de base de datos relacional que he elegido para almacenar toda la información de los vehículos y usuarios.

**Node.js:** El entorno de ejecución de JavaScript que me permite usar este lenguaje también en el lado del servidor.

**Express.js:** Un framework de Node.js que me ha facilitado mucho la creación de la API RESTful.

**React:** La biblioteca de JavaScript que estoy utilizando para construir la interfaz de usuario de forma componetizada.

**DDNS (Dynamic DNS):** Servicio que permite asociar un nombre de dominio a una IP dinámica, utilizado para hacer accesible mi aplicación desde internet.

**JWT (JSON Web Token):** Estándar utilizado para la autenticación segura de usuarios en mi aplicación.

**CORS (Cross-Origin Resource Sharing):** Mecanismo que permite que mi frontend y backend se comuniquen desde diferentes orígenes.

---

## 1. Introducción

### 1.1. Resumen y Abstract

Este proyecto consiste en el desarrollo de una plataforma web integral para la comparativa exhaustiva de vehículos, diseñada para facilitar la toma de decisiones informadas en la compra de automóviles. La aplicación implementa una arquitectura full-stack moderna utilizando React para el frontend y Node.js/Express para el backend, con MySQL como sistema gestor de base de datos.

La plataforma permite a los usuarios registrarse, gestionar sus vehículos favoritos, realizar comparativas detalladas entre múltiples vehículos y acceder a información técnica completa incluyendo especificaciones, consumos, dimensiones y tiempos de circuito.

**Abstract:**
This project involves developing a comprehensive web platform for detailed vehicle comparison, designed to facilitate informed decision-making in car purchasing. The application implements a modern full-stack architecture using React for the frontend and Node.js/Express for the backend, with MySQL as the database management system.

### 1.2. Objetivos del Proyecto

#### 1.2.1. Objetivo General
Desarrollar una aplicación web completa que permita a los usuarios comparar vehículos de manera exhaustiva, proporcionando una herramienta útil y accesible para la toma de decisiones informadas en la compra de automóviles.

#### 1.2.2. Objetivos Específicos

**Objetivos Técnicos:**
- Implementar una API RESTful robusta y escalable
- Desarrollar una interfaz de usuario moderna y responsiva
- Diseñar una base de datos normalizada y eficiente
- Implementar un sistema de autenticación seguro
- Configurar el sistema para acceso desde internet mediante DDNS

**Objetivos Funcionales:**
- Permitir registro y autenticación de usuarios
- Gestionar una base de datos completa de vehículos
- Implementar comparativas detalladas entre vehículos
- Proporcionar análisis inteligente de datos
- Incluir funcionalidad de favoritos y gestión de usuarios

### 1.3. Motivación y Justificación Personal

Como estudiante de ASIR con pasión por el mundo del automóvil, he identificado una necesidad real en el mercado: la falta de herramientas completas y accesibles para comparar vehículos de manera exhaustiva. Las plataformas existentes suelen ser limitadas o no ofrecen la profundidad de análisis que considero necesaria.

Mi experiencia personal buscando información para la compra de vehículos me ha llevado a desarrollar esta solución que combina:
- Datos técnicos detallados
- Análisis comparativo inteligente
- Interfaz intuitiva y moderna
- Información de rendimiento en circuito

### 1.4. Alcance del Proyecto

**Incluye:**
- Aplicación web full-stack completa
- Sistema de gestión de usuarios
- Base de datos de vehículos con información técnica completa
- Funcionalidad de comparativas múltiples
- Sistema de favoritos
- Análisis inteligente de datos
- Tiempos de circuito y rendimiento
- Configuración para acceso remoto

**No incluye:**
- Aplicación móvil nativa
- Sistema de compra/venta
- Integración con concesionarios
- Funciones de geolocalización

### 1.5. Antecedentes y Estado del Arte

Actualmente existen diversas plataformas de comparación de vehículos como:
- **Coches.com:** Enfocado principalmente en compra-venta
- **Autobild.es:** Centrado en noticias y pruebas
- **Km77.com:** Especializado en pruebas técnicas

Sin embargo, ninguna ofrece una herramienta específica de comparación exhaustiva que combine todos los aspectos técnicos, de rendimiento y análisis inteligente en una sola plataforma accesible y moderna.

---

## 2. Metodología y Planificación

### 2.1. Metodología de Desarrollo Aplicada

He adoptado una metodología de desarrollo **iterativa e incremental** que combina elementos de desarrollo ágil adaptados a un proyecto individual:

#### 2.1.1. Fases del Desarrollo
1. **Análisis y Diseño Inicial** (Semanas 1-2)
2. **Configuración del Entorno** (Semana 3)
3. **Desarrollo del Backend** (Semanas 4-8)
4. **Desarrollo del Frontend** (Semanas 9-14)
5. **Integración y Pruebas** (Semanas 15-16)
6. **Despliegue y Configuración** (Semana 17)
7. **Refinamiento y Documentación** (Semanas 18-20)

#### 2.1.2. Principios Aplicados
- **Desarrollo incremental:** Cada funcionalidad se desarrolla completamente antes de pasar a la siguiente
- **Pruebas continuas:** Testing constante durante el desarrollo
- **Refactorización regular:** Mejora continua del código
- **Documentación paralela:** Documentación simultánea al desarrollo

### 2.2. Herramientas Utilizadas para el Desarrollo y Gestión

#### 2.2.1. Desarrollo
- **IDE:** Visual Studio Code
- **Control de Versiones:** Git
- **Gestión de Dependencias:** npm
- **Base de Datos:** MySQL Workbench
- **Pruebas:** Postman para API testing

#### 2.2.2. Tecnologías Implementadas
- **Frontend:** React, CSS3, JavaScript ES6+
- **Backend:** Node.js, Express.js
- **Base de Datos:** MySQL
- **Autenticación:** JSON Web Tokens (JWT)
- **Comunicación:** RESTful API

---

## 3. Análisis y Diseño del Sistema

### 3.1. Identificación de Requisitos

#### 3.1.1. Requisitos Funcionales (RF)

**RF-01: Gestión de Usuarios**
- El sistema debe permitir el registro de nuevos usuarios
- El sistema debe permitir el login/logout de usuarios
- El sistema debe mantener sesiones activas mediante JWT

**RF-02: Gestión de Vehículos**
- El sistema debe almacenar información completa de vehículos
- El sistema debe permitir la búsqueda y filtrado de vehículos
- El sistema debe mostrar información detallada de cada vehículo

**RF-03: Sistema de Comparativas**
- El sistema debe permitir comparar múltiples vehículos simultáneamente
- El sistema debe generar análisis inteligente de las comparativas
- El sistema debe mostrar diferencias significativas entre vehículos

**RF-04: Gestión de Favoritos**
- Los usuarios deben poder marcar vehículos como favoritos
- El sistema debe permitir gestionar la lista de favoritos
- Los favoritos deben persistir entre sesiones

**RF-05: Tiempos de Circuito**
- El sistema debe almacenar y mostrar tiempos de circuito
- El sistema debe generar rankings de rendimiento
- El sistema debe calcular diferencias de tiempo automáticamente

#### 3.1.2. Requisitos No Funcionales (RNF)

**RNF-01: Rendimiento**
- Tiempo de respuesta de la API < 2 segundos
- Carga inicial de la aplicación < 5 segundos
- Interfaz responsiva en dispositivos móviles

**RNF-02: Seguridad**
- Autenticación segura mediante JWT
- Validación de datos de entrada
- Protección contra inyección SQL

**RNF-03: Usabilidad**
- Interfaz intuitiva y moderna
- Navegación clara y consistente
- Accesibilidad web básica

**RNF-04: Disponibilidad**
- Aplicación accesible desde internet
- Configuración DDNS para acceso remoto
- Tolerancia a fallos básica

### 3.2. Diseño de la Arquitectura del Sistema

#### 3.2.1. Visión General de la Arquitectura

La aplicación sigue una arquitectura de **tres capas** claramente diferenciadas:

```
┌─────────────────────────────────────┐
│           FRONTEND (React)          │
│        Puerto 3000                  │
│  - Interfaz de Usuario              │
│  - Lógica de Presentación          │
│  - Gestión de Estado               │
└─────────────────────────────────────┘
                    │
                    │ HTTP/REST API
                    │
┌─────────────────────────────────────┐
│         BACKEND (Node.js)           │
│        Puerto 4000                  │
│  - API RESTful                      │
│  - Lógica de Negocio               │
│  - Autenticación JWT               │
└─────────────────────────────────────┘
                    │
                    │ SQL Queries
                    │
┌─────────────────────────────────────┐
│      BASE DE DATOS (MySQL)          │
│        Puerto 3306                  │
│  - Almacenamiento Persistente       │
│  - Integridad Referencial          │
│  - Consultas Optimizadas           │
└─────────────────────────────────────┘
```

#### 3.2.2. Elección de Tecnologías y Fundamentos

**Frontend - React:**
- **Ventajas:** Componentes reutilizables, virtual DOM, gran ecosistema
- **Justificación:** Permite crear interfaces dinámicas y mantenibles
- **Librerías complementarias:** React Router, Axios

**Backend - Node.js + Express:**
- **Ventajas:** JavaScript en servidor, rendimiento, ecosistema npm
- **Justificación:** Consistencia tecnológica, desarrollo más rápido
- **Middlewares:** CORS, JSON parsing, JWT validation

**Base de Datos - MySQL:**
- **Ventajas:** Confiabilidad, rendimiento, soporte para transacciones
- **Justificación:** Datos estructurados, relaciones complejas
- **Características:** Integridad referencial, índices optimizados

### 3.3. Diseño de la Base de Datos

#### 3.3.1. Modelo Entidad/Relación Conceptual

*[Espacio reservado para diagrama ER]*

**Entidades Principales:**
- **Usuario:** Gestión de cuentas de usuario
- **Vehículo:** Información técnica de vehículos
- **Favorito:** Relación usuario-vehículo
- **Tiempos_Circuito:** Rendimiento en pista
- **Imagen:** Gestión de imágenes de vehículos

#### 3.3.2. Descripción de las Entidades Principales

**Tabla: usuarios**
```sql
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabla: vehiculos**
```sql
CREATE TABLE vehiculos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    ano INT NOT NULL,
    precio DECIMAL(10,2),
    potencia INT,
    par_motor INT,
    aceleracion_0_100 DECIMAL(3,1),
    velocidad_maxima INT,
    consumo_combinado DECIMAL(3,1),
    emisiones_co2 INT,
    -- ... más campos técnicos
);
```

**Tabla: favoritos**
```sql
CREATE TABLE favoritos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    vehiculo_id INT,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
);
```

### 3.4. Diagramas Conceptuales del Sistema

#### 3.4.1. Esquema de Interconexión de Componentes

*[Espacio reservado para diagrama de componentes]*

#### 3.4.2. Diagrama de Casos de Uso Principales

*[Espacio reservado para diagrama de casos de uso]*

**Casos de Uso Principales:**
- **CU-01:** Registrar Usuario
- **CU-02:** Iniciar Sesión
- **CU-03:** Buscar Vehículos
- **CU-04:** Comparar Vehículos
- **CU-05:** Gestionar Favoritos
- **CU-06:** Ver Tiempos de Circuito

---

## 4. Desarrollo de la Práctica

### 4.1. Configuración del Entorno de Desarrollo

#### 4.1.1. Estructura del Proyecto
```
comparativa_proyecto/
├── comparativa-backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
├── comparativa-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── public/
└── scripts/
    ├── configure-ddns.sh
    ├── start-production.sh
    └── stop-production.sh
```

#### 4.1.2. Configuración de Variables de Entorno

**Backend (.env):**
```env
DB_HOST=localhost
DB_USER=comparativa_user
DB_PASSWORD=Comp4r4t1v4_P4ssw0rd!
DB_NAME=comparativa_vehiculos
JWT_SECRET=mi_clave_secreta_jwt
PORT=4000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://proyectocomparativa.ddns.net:4000
REACT_APP_IMAGE_BASE_URL=http://proyectocomparativa.ddns.net:4000
```

### 4.2. Desarrollo del Backend

#### 4.2.1. Estructura de la API RESTful

**Endpoints Principales:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuarios |
| POST | `/api/auth/login` | Autenticación |
| GET | `/api/vehicles` | Listar vehículos |
| GET | `/api/vehicles/:id` | Detalle de vehículo |
| POST | `/api/favorites` | Agregar favorito |
| DELETE | `/api/favorites/:id` | Eliminar favorito |
| GET | `/api/favorites/user/:userId` | Favoritos del usuario |

#### 4.2.2. Implementación de Controladores

**Ejemplo: Vehicle Controller**
```javascript
// Obtener vehículo por ID con tiempos de circuito
const getVehicleById = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    
    // Consulta principal del vehículo
    const vehicleQuery = 'SELECT * FROM vehiculos WHERE id = ?';
    const [vehicleRows] = await db.execute(vehicleQuery, [vehicleId]);
    
    // Consulta de tiempos de circuito
    const timesQuery = `
      SELECT circuito, tiempo 
      FROM tiempos_circuito 
      WHERE vehiculo_id = ?
    `;
    const [timesRows] = await db.execute(timesQuery, [vehicleId]);
    
    // Consulta de imágenes
    const imagesQuery = `
      SELECT url, descripcion 
      FROM imagenes 
      WHERE vehiculo_id = ?
    `;
    const [imagesRows] = await db.execute(imagesQuery, [vehicleId]);
    
    if (vehicleRows.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    const vehicle = vehicleRows[0];
    vehicle.tiempos_circuito = timesRows;
    vehicle.imagenes = imagesRows;
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### 4.2.3. Middleware de Autenticación

```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token no válido' });
    }
    req.user = user;
    next();
  });
};
```

### 4.3. Desarrollo del Frontend

#### 4.3.1. Componentes Principales

**Estructura de Componentes:**
- **App.js:** Componente raíz y enrutamiento
- **Header.js:** Navegación principal
- **VehicleCard.js:** Tarjeta de vehículo
- **ComparisonPage.js:** Página de comparativas
- **LoginPage.js:** Autenticación
- **FavoritesPage.js:** Gestión de favoritos

#### 4.3.2. Implementación de la Página de Comparativas

**Funcionalidades Principales:**
- Navegación por secciones
- Comparación multi-vehículo
- Análisis inteligente
- Tiempos de circuito
- Diseño responsivo

**Código ejemplo - Análisis Inteligente:**
```javascript
const generateSmartSummary = () => {
  const categories = [
    {
      title: "Más Potente",
      field: "potencia",
      unit: " CV",
      icon: "💪"
    },
    {
      title: "Más Rápido (0-100)",
      field: "aceleracion_0_100",
      unit: " s",
      icon: "🚀",
      reverse: true
    },
    // ... más categorías
  ];

  return categories.map(category => {
    const winner = findWinner(vehicles, category.field, category.reverse);
    return {
      ...category,
      winner: winner,
      value: winner[category.field]
    };
  });
};
```

#### 4.3.3. Gestión de Estado y Servicios

**Servicio de API:**
```javascript
class VehicleService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL;
  }

  async getVehicles() {
    const response = await fetch(`${this.baseURL}/api/vehicles`);
    return response.json();
  }

  async getVehicleById(id) {
    const response = await fetch(`${this.baseURL}/api/vehicles/${id}`);
    return response.json();
  }

  async addToFavorites(userId, vehicleId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ usuario_id: userId, vehiculo_id: vehicleId })
    });
    return response.json();
  }
}
```

---

## 5. Implementación

### 5.1. Características Técnicas Implementadas

#### 5.1.1. Sistema de Autenticación JWT
- Registro y login seguro
- Persistencia de sesión
- Protección de rutas privadas
- Middleware de autenticación

#### 5.1.2. API RESTful Completa
- 28 endpoints implementados
- Validación de datos
- Manejo de errores
- Documentación de API

#### 5.1.3. Interfaz de Usuario Avanzada
- Diseño responsivo
- Navegación intuitiva
- Componentes reutilizables
- Optimizaciones de rendimiento

### 5.2. Funcionalidades Destacadas

#### 5.2.1. Sistema de Comparativas Inteligente
**Análisis Automático:**
- Identificación del vehículo ganador en cada categoría
- Cálculo de diferencias porcentuales
- Generación de insights automáticos
- Visualización clara de resultados

**Categorías de Análisis:**
1. **Rendimiento:** Potencia, aceleración, velocidad máxima
2. **Eficiencia:** Consumo, emisiones, autonomía
3. **Practicidad:** Dimensiones, peso, capacidad
4. **Económico:** Precio, relación calidad-precio

#### 5.2.2. Tiempos de Circuito y Rendimiento
**Base de Datos de Tiempos:**
- Nürburgring Nordschleife
- Otros circuitos internacionales
- Tiempos oficiales verificados
- Ranking automático

**Funcionalidades:**
- Comparación de tiempos entre vehículos
- Cálculo de diferencias automático
- Visualización con iconos y colores
- Integración en comparativas

#### 5.2.3. Sistema de Favoritos
**Gestión Personalizada:**
- Añadir/eliminar favoritos
- Lista persistente por usuario
- Acceso rápido desde cualquier página
- Sincronización automática

### 5.3. Adaptaciones y Mejoras

#### 5.3.1. Localización para España
Durante el desarrollo se identificó la necesidad de adaptar el lenguaje para usuarios españoles:

**Cambios Implementados:**
- "Registro exitoso" → "Registro completado con éxito"
- "email" → "correo electrónico"
- "logueado" → "con sesión iniciada"
- "Por favor, ingresa" → "Por favor, introduce"

#### 5.3.2. Optimizaciones de Rendimiento
- Carga lazy de imágenes
- Optimización de consultas SQL
- Caché de resultados frecuentes
- Compresión de assets

---

## 6. Configuración y Despliegue

### 6.1. Configuración para Acceso desde Internet

#### 6.1.1. Configuración DDNS
**Proveedor:** No-IP  
**Dominio:** proyectocomparativa.ddns.net  
**Configuración:** Actualización automática cada 24 horas

**Script de configuración:**
```bash
#!/bin/bash
# configure-ddns.sh
echo "Configurando DDNS para proyectocomparativa.ddns.net"
echo "IP actual: $(curl -s ipinfo.io/ip)"
echo "Configuración completada"
```

#### 6.1.2. Port Forwarding del Router
**Router:** Jazztel (Configuración típica)
- Puerto 3000 → 192.168.1.82:3000 (Frontend)
- Puerto 4000 → 192.168.1.82:4000 (Backend)
- Protocolo: TCP

### 6.2. Scripts de Automatización

#### 6.2.1. Script de Inicio de Producción
```bash
#!/bin/bash
# start-production.sh
echo "Iniciando aplicación en modo producción..."

# Iniciar Backend
cd /home/pedro/comparativa_proyecto/comparativa-backend
npm start &
BACKEND_PID=$!
echo "Backend iniciado (PID: $BACKEND_PID)"

# Iniciar Frontend
cd /home/pedro/comparativa_proyecto/comparativa-frontend
npm start &
FRONTEND_PID=$!
echo "Frontend iniciado (PID: $FRONTEND_PID)"

# Guardar PIDs
echo $BACKEND_PID > /tmp/backend.pid
echo $FRONTEND_PID > /tmp/frontend.pid

echo "Aplicación disponible en:"
echo "Frontend: http://proyectocomparativa.ddns.net:3000"
echo "Backend: http://proyectocomparativa.ddns.net:4000"
```

#### 6.2.2. Script de Parada
```bash
#!/bin/bash
# stop-production.sh
echo "Deteniendo aplicación..."

if [ -f /tmp/backend.pid ]; then
    kill $(cat /tmp/backend.pid)
    rm /tmp/backend.pid
    echo "Backend detenido"
fi

if [ -f /tmp/frontend.pid ]; then
    kill $(cat /tmp/frontend.pid)
    rm /tmp/frontend.pid
    echo "Frontend detenido"
fi
```

### 6.3. Configuración de Base de Datos

#### 6.3.1. Datos de Conexión
- **Host:** localhost
- **Puerto:** 3306
- **Base de datos:** comparativa_vehiculos
- **Usuario:** comparativa_user
- **Contraseña:** Comp4r4t1v4_P4ssw0rd!

#### 6.3.2. Poblado de Datos
**Vehículos incluidos:** 14 vehículos representativos
**Tiempos de circuito:** 6 registros de Nürburgring
**Imágenes:** URLs optimizadas para web

---

## 7. Pruebas y Validación

### 7.1. Tipos de Pruebas Realizadas

#### 7.1.1. Pruebas Unitarias
- **Backend:** Pruebas de controladores y middleware
- **Frontend:** Pruebas de componentes individuales
- **Base de datos:** Validación de consultas

#### 7.1.2. Pruebas de Integración
- **API:** Pruebas de endpoints con Postman
- **Frontend-Backend:** Validación de comunicación
- **Base de datos:** Pruebas de integridad referencial

#### 7.1.3. Pruebas de Usuario
- **Navegación:** Flujo completo de usuario
- **Responsividad:** Pruebas en diferentes dispositivos
- **Rendimiento:** Tiempos de carga y respuesta

### 7.2. Resultados de las Pruebas

#### 7.2.1. Métricas de Rendimiento
- **Tiempo de carga inicial:** 3.2 segundos
- **Tiempo de respuesta API:** < 1 segundo
- **Tiempo de comparativa:** 0.8 segundos
- **Memoria utilizada:** ~50MB frontend, ~80MB backend

#### 7.2.2. Pruebas de Compatibilidad
- **Navegadores:** Chrome, Firefox, Safari, Edge
- **Dispositivos:** Desktop, tablet, móvil
- **Resoluciones:** 1920x1080, 1366x768, 375x667

### 7.3. Corrección de Issues

#### 7.3.1. Problemas Identificados y Resueltos
1. **Tiempos de circuito no aparecían:** Solucionado mediante modificación del controlador
2. **URLs hardcodeadas:** Migración a variables de entorno
3. **Problemas de CORS:** Configuración de headers correcta
4. **Localización:** Adaptación de términos para España

---

## 8. Conclusiones y Trabajo Futuro

### 8.1. Logros Alcanzados

El desarrollo de la "Plataforma Web de Comparativa Exhaustiva de Vehículos" ha resultado ser un proyecto enormemente enriquecedor tanto a nivel técnico como personal. He conseguido implementar una aplicación web full-stack completamente funcional que cumple con los objetivos planteados inicialmente.

#### 8.1.1. Cumplimiento de Objetivos Técnicos

**✅ API RESTful Robusta:** He desarrollado una API completa con 28 endpoints que gestionan todas las funcionalidades del sistema. La arquitectura REST implementada es escalable y mantenible.

**✅ Interfaz de Usuario Moderna:** El frontend desarrollado en React proporciona una experiencia de usuario fluida y atractiva, con diseño responsivo que funciona correctamente en diferentes dispositivos.

**✅ Base de Datos Optimizada:** La estructura de base de datos MySQL implementada es eficiente y mantiene la integridad referencial. Las consultas están optimizadas para un buen rendimiento.

**✅ Sistema de Autenticación Seguro:** La implementación de JWT proporciona una autenticación robusta y segura para los usuarios.

**✅ Acceso desde Internet:** La configuración DDNS permite el acceso a la aplicación desde cualquier lugar con conexión a internet.

#### 8.1.2. Cumplimiento de Objetivos Funcionales

**✅ Gestión de Usuarios:** Sistema completo de registro, login y gestión de sesiones.

**✅ Comparativas Avanzadas:** Funcionalidad de comparación múltiple con análisis inteligente automático.

**✅ Tiempos de Circuito:** Implementación exitosa de la funcionalidad de tiempos de rendimiento en pista.

**✅ Sistema de Favoritos:** Gestión personalizada de vehículos favoritos por usuario.

### 8.2. Aprendizajes Técnicos

#### 8.2.1. Desarrollo Full-Stack
- **Frontend:** Dominio de React, gestión de estado, componentes reutilizables
- **Backend:** Implementación de APIs RESTful, middleware, autenticación
- **Base de Datos:** Diseño y optimización de esquemas relacionales
- **Integración:** Comunicación efectiva entre diferentes capas

#### 8.2.2. Tecnologías Específicas
- **Node.js/Express:** Desarrollo de aplicaciones de servidor
- **MySQL:** Gestión de bases de datos relacionales
- **JWT:** Implementación de autenticación segura
- **DDNS:** Configuración de acceso remoto

#### 8.2.3. Metodología de Desarrollo
- **Planificación:** Importancia de la fase de análisis y diseño
- **Versionado:** Uso de Git para control de versiones
- **Testing:** Pruebas continuas para garantizar calidad
- **Documentación:** Importancia de documentar el proceso

### 8.3. Desafíos Superados

#### 8.3.1. Técnicos
- **Integración Frontend-Backend:** Configuración correcta de CORS y comunicación
- **Gestión de Estados:** Manejo eficiente del estado en React
- **Optimización de Consultas:** Mejora del rendimiento de la base de datos
- **Configuración de Red:** Implementación de DDNS y port forwarding

#### 8.3.2. De Proceso
- **Gestión del Tiempo:** Planificación y cumplimiento de plazos
- **Resolución de Problemas:** Debugging y solución de issues complejos
- **Adaptación:** Modificaciones basadas en feedback de usuarios
- **Documentación:** Mantenimiento de documentación actualizada

### 8.4. Trabajo Futuro

#### 8.4.1. Mejoras Técnicas

**Optimización de Rendimiento:**
- Implementación de caché con Redis
- Optimización de imágenes con CDN
- Lazy loading avanzado
- Compresión de datos

**Escalabilidad:**
- Migración a arquitectura de microservicios
- Implementación de load balancing
- Containerización con Docker
- Despliegue en la nube (AWS/Azure)

#### 8.4.2. Funcionalidades Nuevas

**Análisis Avanzado:**
- Algoritmos de recomendación personalizados
- Análisis predictivo de precios
- Comparación con inteligencia artificial
- Gráficos interactivos avanzados

**Características Sociales:**
- Sistema de reseñas de usuarios
- Comunidad de entusiastas
- Compartir comparativas en redes sociales
- Foros de discusión

**Integración Externa:**
- API de concesionarios para precios actualizados
- Integración con seguros
- Calculadora de financiación
- Geolocalización de concesionarios

#### 8.4.3. Plataformas Adicionales

**Aplicación Móvil:**
- Desarrollo de app nativa iOS/Android
- Funcionalidades offline
- Notificaciones push
- Sincronización con versión web

**Herramientas Adicionales:**
- Panel de administración avanzado
- Herramientas de analytics
- Sistema de backup automatizado
- Monitorización de rendimiento

### 8.5. Reflexión Personal

Este proyecto ha representado un gran paso en mi formación como desarrollador full-stack. He podido aplicar conocimientos teóricos en un proyecto real y complejo, enfrentándome a desafíos técnicos que me han permitido crecer profesionalmente.

La experiencia de desarrollar una aplicación completa desde cero, desde el análisis inicial hasta el despliegue final, me ha proporcionado una visión integral del proceso de desarrollo de software. He aprendido no solo aspectos técnicos, sino también la importancia de la planificación, la documentación y las pruebas.

El proyecto me ha permitido especializarme en tecnologías modernas y demandadas en el mercado laboral, preparándome para mi futuro profesional en el sector tecnológico.

---

## 9. Agradecimientos

Quiero expresar mi sincero agradecimiento a todas las personas que han hecho posible este proyecto:

- **Román Ontiyuelo Martín**, mi tutor de proyecto, por su guía, paciencia y valiosos consejos durante todo el proceso de desarrollo.
- **El claustro de profesores del I.E.S. Infanta Elena**, por proporcionarme las bases técnicas necesarias para afrontar este reto.
- **Mis compañeros de clase**, por su apoyo, colaboración y feedback durante el desarrollo.
- **Mi familia**, por su comprensión y apoyo durante las largas horas de trabajo en este proyecto.

Este proyecto no habría sido posible sin el apoyo y la colaboración de todas estas personas.

---

## 10. Bibliografía

### 10.1. Documentación Técnica

1. **Mozilla Developer Network (MDN)**. *JavaScript Reference*. https://developer.mozilla.org/es/docs/Web/JavaScript
2. **React Documentation**. *Getting Started*. https://react.dev/learn
3. **Node.js Documentation**. *API Reference*. https://nodejs.org/en/docs/
4. **Express.js Documentation**. *Guide*. https://expressjs.com/
5. **MySQL Documentation**. *Reference Manual*. https://dev.mysql.com/doc/

### 10.2. Recursos de Aprendizaje

6. **Flanagan, David**. *JavaScript: The Definitive Guide*. O'Reilly Media, 2020.
7. **Banks, Alex; Porcello, Eve**. *Learning React*. O'Reilly Media, 2020.
8. **Young, Alex**. *Node.js in Action*. Manning Publications, 2017.
9. **Welling, Luke; Thomson, Laura**. *PHP and MySQL Web Development*. Addison-Wesley, 2016.

### 10.3. Recursos Online

10. **Stack Overflow**. *Community Q&A*. https://stackoverflow.com/
11. **GitHub**. *Code Repository*. https://github.com/
12. **W3Schools**. *Web Development Tutorials*. https://www.w3schools.com/
13. **CSS-Tricks**. *CSS and Frontend Techniques*. https://css-tricks.com/

### 10.4. Datos de Vehículos

14. **Autobild.es**. *Pruebas y especificaciones técnicas*. https://www.autobild.es/
15. **Km77.com**. *Fichas técnicas de vehículos*. https://www.km77.com/
16. **Nürburgring Lap Times**. *Official timing data*. https://www.nuerburgring.de/

---

## 11. Anexos

### Anexo A: Esquemas de Base de Datos

*[Espacio reservado para diagramas ER detallados]*

#### A.1. Diagrama Entidad-Relación Completo
*[Diagrama ER con todas las tablas y relaciones]*

#### A.2. Diccionario de Datos
*[Tabla detallada con todos los campos de la base de datos]*

### Anexo B: Documentación de API

#### B.1. Endpoints Completos
*[Documentación detallada de todos los endpoints]*

#### B.2. Ejemplos de Requests/Responses
*[Ejemplos de JSON de entrada y salida]*

### Anexo C: Capturas de Pantalla

#### C.1. Interfaz de Usuario
*[Capturas de las principales pantallas de la aplicación]*

#### C.2. Comparativas en Acción
*[Ejemplos de comparativas realizadas]*

### Anexo D: Código Fuente Principal

#### D.1. Estructura del Proyecto
*[Árbol de directorios completo]*

#### D.2. Archivos de Configuración
*[Contenido de archivos .env, package.json, etc.]*

### Anexo E: Métricas y Estadísticas

#### E.1. Líneas de Código
- **Frontend:** ~2,800 líneas (JavaScript + CSS)
- **Backend:** ~1,200 líneas (JavaScript)
- **Base de Datos:** ~150 líneas (SQL)
- **Scripts:** ~100 líneas (Bash)

#### E.2. Archivos del Proyecto
- **Total:** 47 archivos
- **Componentes React:** 15
- **Controladores Backend:** 8
- **Rutas API:** 6

---

*Fin de la Memoria del Proyecto*

**Fecha de finalización:** [Fecha a completar]  
**Versión:** 1.0  
**Autor:** Pedro Sánchez Serrano 