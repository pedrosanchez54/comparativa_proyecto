-- Script Completo: Creación de Esquema e Inserción de Datos para Comparativa Vehículos
-- Versión Final Consolidada

-- --- PREPARACIÓN ---
-- Ejecutar como usuario 'comparativa_user' en la base de datos 'comparativa_vehiculos'

-- Usar la base de datos correcta
USE comparativa_vehiculos;

-- Desactivar chequeo de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS=0;

-- --- CREACIÓN DE TABLAS (Versión Final) ---

-- Tabla de Usuarios
DROP TABLE IF EXISTS Usuarios;
CREATE TABLE Usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL COMMENT 'Hash de la contraseña (Argon2)',
  rol ENUM('admin', 'user') DEFAULT 'user' COMMENT 'Rol del usuario en el sistema',
  intentos_login INT DEFAULT 0 COMMENT 'Contador de intentos fallidos de login',
  bloqueado_hasta DATETIME DEFAULT NULL COMMENT 'Fecha hasta la que la cuenta está bloqueada',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación de la cuenta',
  token_recuperacion VARCHAR(64) DEFAULT NULL COMMENT 'Token único para restablecer contraseña',
  expiracion_token DATETIME DEFAULT NULL COMMENT 'Fecha de expiración del token de recuperación',
  INDEX idx_email (email)
) ENGINE=InnoDB COMMENT='Almacena información de los usuarios registrados';

-- Tabla de Vehículos
DROP TABLE IF EXISTS Vehiculos;
CREATE TABLE Vehiculos (
  id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  version VARCHAR(100) NULL COMMENT 'Ej: GT Line, Sport, Longe Range',
  año YEAR NOT NULL COMMENT 'Año del modelo (no necesariamente de fabricación)',
  tipo ENUM('Sedán','SUV','Deportivo','Hatchback','Coupé','Furgoneta','Urbano','Pick-up','Monovolumen','Cabrio','Familiar','Otro') NOT NULL COMMENT 'Tipo de carrocería principal',
  combustible ENUM('Gasolina','Diésel','Híbrido','Híbrido Enchufable','Eléctrico','GLP','GNC','Hidrógeno','Otro') NOT NULL,
  pegatina_ambiental ENUM('0','ECO','B','C','Sin etiqueta') DEFAULT 'Sin etiqueta' COMMENT 'Etiqueta medioambiental DGT España',
  potencia SMALLINT UNSIGNED COMMENT 'CV (Caballos de Vapor)',
  par_motor SMALLINT UNSIGNED COMMENT 'Nm (Newton Metro)',
  velocidad_max SMALLINT UNSIGNED COMMENT 'km/h',
  aceleracion_0_100 DECIMAL(4,1) COMMENT 'segundos (Ej: 8.5)',
  distancia_frenado_100_0 DECIMAL(5,1) COMMENT 'metros',
  consumo_urbano DECIMAL(5,1) COMMENT 'l/100km o kWh/100km',
  consumo_extraurbano DECIMAL(5,1) COMMENT 'l/100km o kWh/100km',
  consumo_mixto DECIMAL(5,1) COMMENT 'l/100km o kWh/100km',
  emisiones SMALLINT UNSIGNED COMMENT 'g/km CO2 (WLTP)',
  autonomia_electrica SMALLINT UNSIGNED COMMENT 'km (WLTP, solo eléctricos/híbridos enchufables)',
  capacidad_bateria DECIMAL(5,1) COMMENT 'kWh (capacidad útil)',
  tiempo_carga_ac DECIMAL(5,1) COMMENT 'horas (carga AC lenta/media, ej: 0-100%)',
  potencia_carga_dc SMALLINT UNSIGNED COMMENT 'kW (potencia máx. carga DC)',
  tiempo_carga_dc_10_80 SMALLINT UNSIGNED COMMENT 'minutos (carga DC 10% a 80%)',
  peso SMALLINT UNSIGNED COMMENT 'kg (en vacío / orden de marcha)',
  num_puertas TINYINT UNSIGNED,
  num_plazas TINYINT UNSIGNED,
  vol_maletero SMALLINT UNSIGNED COMMENT 'litros (ISO 3832)',
  vol_maletero_max SMALLINT UNSIGNED COMMENT 'litros (asientos abatidos)',
  dimension_largo SMALLINT UNSIGNED COMMENT 'mm',
  dimension_ancho SMALLINT UNSIGNED COMMENT 'mm',
  dimension_alto SMALLINT UNSIGNED COMMENT 'mm',
  distancia_entre_ejes SMALLINT UNSIGNED COMMENT 'mm',
  traccion ENUM('Delantera', 'Trasera', 'Total', 'Total Desconectable') NULL,
  caja_cambios ENUM('Manual', 'Automática Convertidor Par', 'Automática CVT', 'Automática Doble Embrague', 'Directa Eléctrico', 'Otra') NULL,
  num_marchas TINYINT UNSIGNED,
  precio_original DECIMAL(10,2) COMMENT 'Precio base orientativo en su año (€)',
  precio_actual_estimado DECIMAL(10,2) NULL COMMENT 'Precio original ajustado por inflación estimada (€)',
  fecha_lanzamiento DATE NULL COMMENT 'Fecha de inicio de comercialización',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_marca_modelo (marca, modelo),
  INDEX idx_año (año),
  INDEX idx_tipo (tipo),
  INDEX idx_combustible (combustible),
  INDEX idx_precio (precio_original),
  INDEX idx_potencia (potencia),
  INDEX idx_emisiones (emisiones)
) ENGINE= InnoDB COMMENT='Catálogo principal de vehículos y sus especificaciones';

-- Índice Full-Text para búsqueda por texto libre
ALTER TABLE Vehiculos ADD FULLTEXT INDEX idx_fulltext_vehiculos (marca, modelo, version);

-- Tabla para almacenar URLs de imágenes de los vehículos
DROP TABLE IF EXISTS Imagenes;
CREATE TABLE Imagenes (
   id_imagen INT AUTO_INCREMENT PRIMARY KEY,
   id_vehiculo INT NOT NULL,
   url VARCHAR(255) NOT NULL COMMENT 'URL absoluta de la imagen',
   descripcion VARCHAR(100) DEFAULT 'Imagen del vehículo' COMMENT 'Ej: Vista frontal, Interior, Maletero',
   orden TINYINT DEFAULT 0 COMMENT 'Para ordenar la galería de imágenes (0 = principal)',
   FOREIGN KEY (id_vehiculo) REFERENCES Vehiculos(id_vehiculo) ON DELETE CASCADE,
   INDEX idx_vehiculo_imagen (id_vehiculo)
) ENGINE=InnoDB COMMENT='URLs de las imágenes asociadas a cada vehículo';

-- Tabla de Listas creadas por usuarios
DROP TABLE IF EXISTS Listas;
CREATE TABLE Listas (
  id_lista INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  nombre_lista VARCHAR(100) NOT NULL,
  descripcion TEXT NULL,
  es_publica BOOLEAN DEFAULT FALSE COMMENT 'Si otros usuarios pueden verla (feature futura?)',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_usuario_lista (id_usuario),
  UNIQUE KEY unique_user_list_name (id_usuario, nombre_lista) COMMENT 'Evita listas duplicadas por usuario'
) ENGINE=InnoDB COMMENT='Listas personalizadas creadas por los usuarios';

-- Tabla de unión entre Listas y Vehículos
DROP TABLE IF EXISTS Vehiculos_Listas;
CREATE TABLE Vehiculos_Listas (
  id_lista INT NOT NULL,
  id_vehiculo INT NOT NULL,
  fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
  notas TEXT NULL COMMENT 'Notas específicas del usuario para este vehículo en esta lista',
  PRIMARY KEY (id_lista, id_vehiculo) COMMENT 'Clave primaria compuesta',
  FOREIGN KEY (id_lista) REFERENCES Listas(id_lista) ON DELETE CASCADE,
  FOREIGN KEY (id_vehiculo) REFERENCES Vehiculos(id_vehiculo) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Relaciona qué vehículos pertenecen a qué listas';

-- Tabla de Favoritos
DROP TABLE IF EXISTS Favoritos;
CREATE TABLE Favoritos (
  id_favorito INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_vehiculo INT NOT NULL,
  fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorito (id_usuario, id_vehiculo) COMMENT 'Un usuario solo puede favoritar un vehículo una vez',
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_vehiculo) REFERENCES Vehiculos(id_vehiculo) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Vehículos marcados como favoritos por cada usuario';

-- Tabla de Tiempos de Circuito
DROP TABLE IF EXISTS Tiempos_Circuito;
CREATE TABLE Tiempos_Circuito (
  id_tiempo INT AUTO_INCREMENT PRIMARY KEY,
  id_vehiculo INT NOT NULL,
  circuito VARCHAR(100) NOT NULL COMMENT 'Ej: Nürburgring Nordschleife, Hockenheim GP',
  tiempo_vuelta TIME(3) NOT NULL COMMENT 'Formato HH:MM:SS.ms',
  condiciones ENUM('Seco','Mojado','Húmedo','Mixto','Nieve/Hielo') DEFAULT 'Seco',
  fecha_record DATE NULL COMMENT 'Fecha en que se registró el tiempo (YYYY-MM-DD)',
  piloto VARCHAR(100) NULL DEFAULT 'Desconocido',
  neumaticos VARCHAR(100) NULL COMMENT 'Ej: Michelin Pilot Sport 4S',
  fuente_url VARCHAR(255) NULL COMMENT 'URL de la fuente/video del tiempo',
  fecha_registro_db DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_vehiculo) REFERENCES Vehiculos(id_vehiculo) ON DELETE CASCADE,
  INDEX idx_vehiculo_tiempo (id_vehiculo),
  INDEX idx_circuito (circuito),
  INDEX idx_tiempo (tiempo_vuelta)
) ENGINE=InnoDB COMMENT='Tiempos de vuelta registrados para los vehículos en diferentes circuitos';


-- --- INSERCIÓN DE DATOS DE EJEMPLO (Versión Final con Datos Mejorados) ---

-- 1. Tabla Usuarios
DELETE FROM Usuarios;
INSERT INTO Usuarios (id_usuario, nombre, email, contraseña, rol, fecha_registro) VALUES
(1, 'Admin User', 'admin@comparativa.test', '$argon2id$v=19$m=65536,t=3,p=4$longRandomSaltPlaceholder$VqG5aKjY9q8z6F3bL2nXsW5gH7jA1kM0p9S8dF4gT1o', 'admin', '2024-01-01 10:00:00'),
(2, 'Regular User', 'user@comparativa.test', '$argon2id$v=19$m=65536,t=3,p=4$anotherRandomSaltHere$K1jL5sD9fG3bH8kP0aN2qW7xV4gZ6yU1tM5sE2dR8oI', 'user', '2024-01-15 11:30:00');


-- 2. Tabla Vehiculos (Datos mejorados y con precio_actual_estimado)
DELETE FROM Vehiculos;
INSERT INTO Vehiculos (
    marca, modelo, version, año, tipo, combustible, pegatina_ambiental,
    potencia, par_motor, velocidad_max, aceleracion_0_100,
    consumo_urbano, consumo_extraurbano, consumo_mixto, emisiones,
    autonomia_electrica, capacidad_bateria, tiempo_carga_ac, potencia_carga_dc, tiempo_carga_dc_10_80,
    distancia_frenado_100_0, peso, num_puertas, num_plazas, vol_maletero, vol_maletero_max,
    dimension_largo, dimension_ancho, dimension_alto, distancia_entre_ejes,
    traccion, caja_cambios, num_marchas,
    precio_original, precio_actual_estimado, fecha_lanzamiento
) VALUES
-- === Hatchbacks (Gasolina) ===
('Volkswagen', 'Golf', 'GTI Mk2 8v', 1990, 'Hatchback', 'Gasolina', 'Sin etiqueta', 112, 159, 191, 10.1, 10.5, 6.1, 7.8, 185, NULL, NULL, NULL, NULL, NULL, 42.0, 960, 3, 5, 345, 1145, 3985, 1665, 1415, 2475, 'Delantera', 'Manual', 5, 15000.00, 42000.00, '1984-01-01'),
('SEAT', 'Ibiza', '1.0 TSI 110 FR Go', 2021, 'Hatchback', 'Gasolina', 'C', 110, 200, 195, 10.3, 5.8, 4.1, 4.7, 108, NULL, NULL, NULL, NULL, NULL, 35.5, 1163, 5, 5, 355, 1165, 4059, 1780, 1444, 2564, 'Delantera', 'Manual', 6, 20500.00, 24600.00, '2021-05-01'),
('Ford', 'Focus', '1.0 EcoBoost 125 ST-Line', 2019, 'Hatchback', 'Gasolina', 'C', 125, 170, 200, 10.0, 6.0, 4.2, 4.9, 111, NULL, NULL, NULL, NULL, NULL, 36.5, 1322, 5, 5, 375, 1354, 4378, 1825, 1454, 2700, 'Delantera', 'Manual', 6, 24000.00, 32400.00, '2018-07-01'),
('Toyota', 'GR Yaris', 'Circuit Pack', 2020, 'Hatchback', 'Gasolina', 'C', 261, 360, 230, 5.5, 10.7, 6.9, 8.2, 186, NULL, NULL, NULL, NULL, NULL, 35.0, 1280, 3, 4, 174, 737, 4005, 1805, 1455, 2560, 'Total', 'Manual', 6, 37500.00, 45000.00, '2020-09-01'),
('Honda', 'Civic', 'EK9 Type R', 1997, 'Hatchback', 'Gasolina', 'Sin etiqueta', 185, 160, 225, 6.7, 9.5, 7.0, 8.0, NULL, NULL, NULL, NULL, NULL, NULL, 37.5, 1050, 3, 4, 225, 600, 4180, 1695, 1360, 2620, 'Delantera', 'Manual', 5, 18000.00, 43200.00, '1997-08-01'),
-- === Sedán ===
('BMW', 'Serie 3', '320d G20', 2020, 'Sedán', 'Diésel', 'C', 190, 400, 240, 6.8, 4.7, 3.7, 4.1, 107, NULL, NULL, NULL, NULL, NULL, 34.0, 1530, 4, 5, 480, 1510, 4709, 1827, 1435, 2851, 'Trasera', 'Automática Convertidor Par', 8, 43700.00, 52440.00, '2019-03-01'),
('Toyota', 'Camry', '2.5 Hybrid 218 Advance', 2022, 'Sedán', 'Híbrido', 'ECO', 218, 221, 180, 8.3, 4.8, 4.2, 4.4, 101, NULL, 1.6, NULL, NULL, NULL, 37.2, 1595, 4, 5, 524, NULL, 4885, 1840, 1445, 2825, 'Delantera', 'Automática CVT', NULL, 40000.00, 48000.00, '2019-04-01'),
('Tesla', 'Model 3', 'Long Range AWD', 2023, 'Sedán', 'Eléctrico', '0', 498, 493, 233, 4.4, NULL, NULL, NULL, 0, 602, 75.0, 8.0, 250, 27, 34.5, 1844, 4, 5, 561, NULL, 4694, 1849, 1443, 2875, 'Total', 'Directa Eléctrico', 1, 50000.00, 60000.00, '2019-02-01'),
('BMW', 'M3', 'Competition G80', 2021, 'Sedán', 'Gasolina', 'C', 510, 650, 290, 3.9, 14.6, 7.6, 10.2, 234, NULL, NULL, NULL, NULL, NULL, 32.8, 1730, 4, 5, 480, NULL, 4794, 1903, 1433, 2857, 'Trasera', 'Automática Convertidor Par', 8, 101000.00, 121200.00, '2021-03-01'),
-- === SUV ===
('Peugeot', '3008', '1.2 PureTech 130 Allure', 2023, 'SUV', 'Gasolina', 'C', 131, 230, 188, 9.5, 7.0, 5.5, 6.1, 138, NULL, NULL, NULL, NULL, NULL, 38.5, 1395, 5, 5, 520, 1482, 4447, 1841, 1624, 2675, 'Delantera', 'Manual', 6, 33000.00, 39600.00, '2020-09-01'),
('Ford', 'Kuga', '2.5 PHEV 225 ST-Line X', 2024, 'SUV', 'Híbrido Enchufable', '0', 225, 200, 200, 9.2, NULL, NULL, 1.0, 22, 64, 14.4, 3.5, NULL, NULL, 37.8, 1844, 5, 5, 412, 1534, 4629, 1883, 1679, 2710, 'Delantera', 'Automática CVT', NULL, 45000.00, 54000.00, '2020-01-10'),
('Cupra', 'Formentor', 'VZ5 2.5 TSI 390', 2021, 'SUV', 'Gasolina', 'C', 390, 480, 250, 4.2, 11.4, 8.1, 9.3, 212, NULL, NULL, NULL, NULL, NULL, 33.5, 1683, 5, 5, 420, 1475, 4468, 1852, 1505, 2681, 'Total', 'Automática Doble Embrague', 7, 62800.00, 75360.00, '2021-10-20'),
('Hyundai', 'Ioniq 5', '77.4kWh RWD', 2022, 'SUV', 'Eléctrico', '0', 228, 350, 185, 7.3, NULL, NULL, NULL, 0, 507, 77.4, 7.0, 220, 18, 36.8, 1985, 5, 5, 527, 1587, 4635, 1890, 1605, 3000, 'Trasera', 'Directa Eléctrico', 1, 48500.00, 58200.00, '2021-06-01'),
-- === Deportivo / Cabrio ===
('Mazda', 'MX-5', 'ND 2.0 Skyactiv-G 184 Zenith', 2019, 'Cabrio', 'Gasolina', 'C', 184, 205, 219, 6.5, 8.4, 5.4, 6.9, 156, NULL, NULL, NULL, NULL, NULL, 35.2, 1030, 2, 2, 130, 130, 3915, 1735, 1230, 2310, 'Trasera', 'Manual', 6, 34000.00, 45900.00, '2018-08-01'),
('Porsche', '911', '992 Carrera S', 2020, 'Deportivo', 'Gasolina', 'C', 450, 530, 308, 3.7, 10.1, 7.8, 8.9, 205, NULL, NULL, NULL, NULL, NULL, 33.0, 1515, 2, 4, 132, 132, 4519, 1852, 1298, 2450, 'Trasera', 'Automática Doble Embrague', 8, 138000.00, 165600.00, '2019-01-15'),
-- === Otros ===
('Citroën', 'Berlingo', 'Talla M BlueHDi 100 Feel', 2021, 'Furgoneta', 'Diésel', 'C', 102, 250, 174, 12.3, 5.9, 4.8, 5.2, 136, NULL, NULL, NULL, NULL, NULL, 40.5, 1430, 5, 5, 775, 3000, 4403, 1848, 1844, 2785, 'Delantera', 'Manual', 6, 23000.00, 27600.00, '2018-09-01'),
('Ford', 'Ranger', 'Raptor 3.0 EcoBoost V6 292cv', 2023, 'Pick-up', 'Gasolina', 'C', 292, 491, 180, 7.9, 17.1, 11.8, 13.8, 315, NULL, NULL, NULL, NULL, NULL, 42.5, 2454, 4, 5, NULL, NULL, 5381, 2028, 1922, 3270, 'Total Desconectable', 'Automática Convertidor Par', 10, 68000.00, 81600.00, '2022-11-01'),
('Renault', 'Espace', 'Initiale Paris Blue dCi 200 EDC', 2019, 'Monovolumen', 'Diésel', 'C', 200, 400, 215, 9.1, 7.1, 5.6, 6.2, 162, NULL, NULL, NULL, NULL, NULL, 38.0, 1734, 5, 7, 247, 2101, 4857, 1888, 1677, 2884, 'Delantera', 'Automática Doble Embrague', 7, 49000.00, 66150.00, '2015-04-01'),
('Audi', 'RS6', 'Avant C8 4.0 TFSI quattro', 2020, 'Familiar', 'Gasolina', 'C', 600, 800, 305, 3.6, 16.2, 9.1, 11.7, 268, NULL, NULL, NULL, NULL, NULL, 33.2, 2075, 5, 5, 565, 1680, 4995, 1951, 1460, 2929, 'Total', 'Automática Convertidor Par', 8, 140000.00, 168000.00, '2019-12-01');


-- 3. Tabla Imagenes (Ajusta IDs si es necesario, asumiendo que empiezan en 1 y siguen el orden de inserción)
DELETE FROM Imagenes;
INSERT INTO Imagenes (id_vehiculo, url, descripcion, orden) VALUES
(1, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/VW_Golf_II_GTI_8V.jpg/1280px-VW_Golf_II_GTI_8V.jpg', 'Vista frontal', 0),
(1, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vw_golf_gti_1991_mk2_8v_interior.jpg/1024px-Vw_golf_gti_1991_mk2_8v_interior.jpg', 'Interior', 1),
(2, 'https://cdn.km77.com/fotos/galerias/seat/ibiza-5-puertas-2021/seat-ibiza-5-puertas-2021-r20210729180123_1/seat-ibiza-5-puertas-2021-202107291801231_large.jpg', 'Frontal FR', 0),
(8, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Tesla_Model_3_LR_AWD_2021_%28cropped%29.jpg/1920px-Tesla_Model_3_LR_AWD_2021_%28cropped%29.jpg', 'Vista frontal', 0),
(13, 'https://cdn.motor1.com/images/mgl/8A1B9A/s1/ford-ranger-raptor-2023.jpg', 'Vista acción', 0),
(16, 'https://cdn.motor1.com/images/mgl/RqrKA/s1/toyota-gr-yaris-2020.jpg', 'GR Yaris frontal', 0),
(17, 'https://cdn.motor1.com/images/mgl/JMAg6/s1/cupra-formentor-vz5-2021.jpg', 'Formentor VZ5 perfil', 0),
(18, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Hyundai_Ioniq_5_in_Action.jpg/1920px-Hyundai_Ioniq_5_in_Action.jpg', 'Ioniq 5 rodando', 0),
(19, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/BMW_M3_Competition_sedan_%28G80%29_at_IAA_2021_1X7A0088.jpg/1920px-BMW_M3_Competition_sedan_%28G80%29_at_IAA_2021_1X7A0088.jpg', 'BMW M3 G80 frontal', 0),
(20, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Audi_RS_6_Avant_%28C8%29_IMG_3698.jpg/1920px-Audi_RS_6_Avant_%28C8%29_IMG_3698.jpg', 'Audi RS6 Avant trasera', 0);


-- 4. Tabla Listas
DELETE FROM Listas;
INSERT INTO Listas (id_lista, id_usuario, nombre_lista, descripcion, es_publica) VALUES
(1, 2, 'Hot Hatch 90s', 'Compactos deportivos icónicos de los 90', 0),
(2, 2, 'Futuro SUV Eléctrico', 'Posibles candidatos para coche familiar EV', 0),
(3, 1, 'Máquinas Nürburgring', 'Coches rápidos para circuito', 0);


-- 5. Tabla Vehiculos_Listas (Ajusta IDs si es necesario)
DELETE FROM Vehiculos_Listas;
INSERT INTO Vehiculos_Listas (id_lista, id_vehiculo, notas) VALUES
(1, 1, 'El clásico original'), (1, 5, 'JDM atmosférico'), -- ID de Civic EK9 es ahora 5
(2, 11, 'Buena autonomía eléctrica y espacio?'), (2, 13, 'Diseño rompedor y carga rápida V2L'), -- IDs de Kuga y Ioniq5 son 11 y 13
(3, 15, 'Equilibrio perfecto'), (3, 9, 'Sedán radical'), (3, 20, 'El familiar definitivo'), (3, 17, 'SUV con motor 5 cilindros!'); -- IDs 911, M3, RS6, Formentor VZ5 son 15, 9, 20, 17


-- 6. Tabla Favoritos (Ajusta IDs si es necesario)
DELETE FROM Favoritos;
INSERT INTO Favoritos (id_usuario, id_vehiculo) VALUES
(2, 14), -- MX-5 es ID 14
(2, 15), -- 911 Carrera S es ID 15
(2, 8),  -- Model 3 es ID 8
(2, 16), -- GR Yaris es ID 16
(1, 9),  -- M3 es ID 9
(1, 20), -- RS6 es ID 20
(1, 17); -- Formentor VZ5 es ID 17


-- 7. Tabla Tiempos_Circuito (Ajusta IDs si es necesario)
DELETE FROM Tiempos_Circuito;
INSERT INTO Tiempos_Circuito (id_vehiculo, circuito, tiempo_vuelta, condiciones, fecha_record, piloto, neumaticos, fuente_url) VALUES
(15, 'Nürburgring Nordschleife', '00:07:25.000', 'Seco', '2019-04-01', 'Christian Gebhardt', 'Pirelli P Zero NA1', 'https://www.sportauto.de/test/porsche-911-carrera-s-992-im-supertest-nordschleife-hockenheimring-runde-fahrleistungen-technische-daten-preis-article-10340174.html'),
(15, 'Hockenheim GP', '00:01:53.300', 'Seco', '2019-04-01', 'Christian Gebhardt', 'Pirelli P Zero NA1', 'https://www.sportauto.de/test/porsche-911-carrera-s-992-im-supertest-nordschleife-hockenheimring-runde-fahrleistungen-technische-daten-preis-article-10340174.html'),
(5, 'Tsukuba Circuit', '00:01:07.500', 'Seco', '1998-01-01', 'Best MOTORing', 'Bridgestone Potenza RE-01', NULL), -- Civic EK9 es ID 5
(16, 'Nürburgring Nordschleife', '00:08:14.930', 'Seco', '2020-08-01', 'Horst von Saurma', 'Michelin Pilot Sport 4S', 'https://www.sportauto.de/test/toyota-gr-yaris-im-supertest-wie-schnell-ist-der-kleine-japaner-auf-nordschleife-und-hockenheimring-article-11095218.html'), -- GR Yaris es ID 16
(9, 'Nürburgring Nordschleife', '00:07:35.900', 'Seco', '2021-07-01', 'Christian Gebhardt', 'Michelin Pilot Sport 4S', 'https://www.sportauto.de/test/bmw-m3-competition-g80-limousine-im-supertest-fahrleistungen-nordschleife-hockenheimring-article-11226744.html'), -- M3 es ID 9
(20, 'Nürburgring Nordschleife', '00:07:40.900', 'Seco', '2019-11-01', 'Horst von Saurma', 'Pirelli P Zero AO', 'https://www.sportauto.de/test/audi-rs-6-avant-c8-im-supertest-rundenzeit-nordschleife-hockenheim-fahrleistungen-technische-daten-article-11035595.html'); -- RS6 es ID 20


-- Reactivar chequeos
SET FOREIGN_KEY_CHECKS=1;

-- Mensaje final
SELECT '¡Esquema de BD creado y todos los datos de ejemplo insertados!' AS Resultado;

