-- Script Completo: Creación de Esquema Normalizado para Comparativa Vehículos
-- Autor: Adaptado por IA
-- Fecha: 2024

-- Elimina y crea la base de datos desde cero
DROP DATABASE IF EXISTS comparativa_vehiculos;
CREATE DATABASE comparativa_vehiculos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE comparativa_vehiculos;
SET FOREIGN_KEY_CHECKS=0;

-- Tabla de Usuarios
CREATE TABLE Usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL COMMENT 'Hash de la contraseña (Argon2)',
  rol ENUM('admin', 'user') DEFAULT 'user',
  intentos_login INT DEFAULT 0,
  bloqueado_hasta DATETIME DEFAULT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  token_recuperacion VARCHAR(64) DEFAULT NULL,
  expiracion_token DATETIME DEFAULT NULL,
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- Tabla de Marcas
CREATE TABLE Marca (
  id_marca INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Tabla de Modelos
CREATE TABLE Modelo (
  id_modelo INT AUTO_INCREMENT PRIMARY KEY,
  id_marca INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  FOREIGN KEY (id_marca) REFERENCES Marca(id_marca) ON DELETE CASCADE,
  UNIQUE KEY unique_modelo (id_marca, nombre)
) ENGINE=InnoDB;

-- Tabla de Generaciones
CREATE TABLE Generacion (
  id_generacion INT AUTO_INCREMENT PRIMARY KEY,
  id_modelo INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  anio_inicio YEAR,
  anio_fin YEAR,
  FOREIGN KEY (id_modelo) REFERENCES Modelo(id_modelo) ON DELETE CASCADE,
  UNIQUE KEY unique_generacion (id_modelo, nombre)
) ENGINE=InnoDB;

-- Tabla de Motorizaciones
CREATE TABLE Motorizacion (
  id_motorizacion INT AUTO_INCREMENT PRIMARY KEY,
  id_generacion INT NOT NULL,
  codigo_motor VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  combustible ENUM('Gasolina','Diésel','Híbrido','Híbrido Enchufable','Eléctrico','GLP','GNC','Hidrógeno','Otro') NOT NULL,
  potencia SMALLINT UNSIGNED,
  par_motor SMALLINT UNSIGNED,
  cilindrada INT UNSIGNED,
  num_cilindros TINYINT UNSIGNED,
  arquitectura VARCHAR(20),
  especificaciones JSON NULL,
  UNIQUE KEY unique_motor (id_generacion, codigo_motor, nombre, potencia, par_motor),
  FOREIGN KEY (id_generacion) REFERENCES Generacion(id_generacion) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla de Vehículos
CREATE TABLE Vehiculo (
  id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
  id_motorizacion INT NOT NULL,
  anio YEAR NOT NULL,
  tipo ENUM('Sedán','SUV','Deportivo','Hatchback','Coupé','Furgoneta','Urbano','Pick-up','Monovolumen','Cabrio','Familiar','Otro') NOT NULL,
  version VARCHAR(100) NULL,
  pegatina_ambiental ENUM('0','ECO','B','C','Sin etiqueta') DEFAULT 'Sin etiqueta',
  velocidad_max SMALLINT UNSIGNED,
  aceleracion_0_100 DECIMAL(4,1),
  distancia_frenado_100_0 DECIMAL(5,1),
  consumo_urbano DECIMAL(5,1),
  consumo_extraurbano DECIMAL(5,1),
  consumo_mixto DECIMAL(5,1),
  emisiones SMALLINT UNSIGNED,
  autonomia_electrica SMALLINT UNSIGNED,
  capacidad_bateria DECIMAL(5,1),
  tiempo_carga_ac DECIMAL(5,1),
  potencia_carga_dc SMALLINT UNSIGNED,
  tiempo_carga_dc_10_80 SMALLINT UNSIGNED,
  peso SMALLINT UNSIGNED,
  num_puertas TINYINT UNSIGNED,
  num_plazas TINYINT UNSIGNED,
  vol_maletero SMALLINT UNSIGNED,
  vol_maletero_max SMALLINT UNSIGNED,
  dimension_largo SMALLINT UNSIGNED,
  dimension_ancho SMALLINT UNSIGNED,
  dimension_alto SMALLINT UNSIGNED,
  distancia_entre_ejes SMALLINT UNSIGNED,
  traccion ENUM('Delantera', 'Trasera', 'Total', 'Total Desconectable') NULL,
  caja_cambios ENUM('Manual', 'Automática Convertidor Par', 'Automática CVT', 'Automática Doble Embrague', 'Directa Eléctrico', 'Otra') NULL,
  num_marchas TINYINT UNSIGNED,
  precio_original DECIMAL(10,2),
  precio_actual_estimado DECIMAL(10,2) NULL,
  fecha_lanzamiento DATE NULL,
  detalle JSON NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_motorizacion) REFERENCES Motorizacion(id_motorizacion) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla de Imágenes (rutas locales)
CREATE TABLE Imagenes (
   id_imagen INT AUTO_INCREMENT PRIMARY KEY,
   id_vehiculo INT NOT NULL,
   ruta_local VARCHAR(255) NOT NULL COMMENT 'Ruta relativa a /comparativa-backend/images/vehiculos/',
   descripcion VARCHAR(100) DEFAULT 'Imagen del vehículo',
   orden TINYINT DEFAULT 0,
   FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo) ON DELETE CASCADE,
   INDEX idx_vehiculo_imagen (id_vehiculo)
) ENGINE=InnoDB;

-- Tabla de Listas
CREATE TABLE Listas (
  id_lista INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  nombre_lista VARCHAR(100) NOT NULL,
  descripcion TEXT NULL,
  es_publica BOOLEAN DEFAULT FALSE,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  UNIQUE KEY unique_user_list_name (id_usuario, nombre_lista)
) ENGINE=InnoDB;

-- Tabla de unión entre Listas y Vehículos
CREATE TABLE Vehiculos_Listas (
  id_lista INT NOT NULL,
  id_vehiculo INT NOT NULL,
  fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
  notas TEXT NULL,
  PRIMARY KEY (id_lista, id_vehiculo),
  FOREIGN KEY (id_lista) REFERENCES Listas(id_lista) ON DELETE CASCADE,
  FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla de Favoritos
CREATE TABLE Favoritos (
  id_favorito INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_vehiculo INT NOT NULL,
  fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorito (id_usuario, id_vehiculo),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla de Tiempos de Circuito
CREATE TABLE Tiempos_Circuito (
  id_tiempo INT AUTO_INCREMENT PRIMARY KEY,
  id_vehiculo INT NOT NULL,
  circuito VARCHAR(100) NOT NULL,
  tiempo_vuelta TIME(3) NOT NULL,
  condiciones ENUM('Seco','Mojado','Húmedo','Mixto','Nieve/Hielo') DEFAULT 'Seco',
  fecha_record DATE NULL,
  piloto VARCHAR(100) NULL DEFAULT 'Desconocido',
  neumaticos VARCHAR(100) NULL,
  fuente_url VARCHAR(255) NULL,
  fecha_registro_db DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo) ON DELETE CASCADE,
  INDEX idx_vehiculo_tiempo (id_vehiculo),
  INDEX idx_circuito (circuito),
  INDEX idx_tiempo (tiempo_vuelta)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=1;
