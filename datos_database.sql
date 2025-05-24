-- Script de inserción de datos para la base de datos normalizada de Comparativa Vehículos
-- Incluye 10 vehículos reales con datos técnicos completos

USE comparativa_vehiculos;
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE Imagenes;
TRUNCATE TABLE Vehiculos_Listas;
TRUNCATE TABLE Favoritos;
TRUNCATE TABLE Vehiculo;
TRUNCATE TABLE Motorizacion;
TRUNCATE TABLE Generacion;
TRUNCATE TABLE Modelo;
TRUNCATE TABLE Marca;
TRUNCATE TABLE Usuarios;
TRUNCATE TABLE Listas;
TRUNCATE TABLE Tiempos_Circuito;
SET FOREIGN_KEY_CHECKS=1;

-- 1. Usuarios
INSERT INTO Usuarios (nombre, email, contraseña, rol, fecha_registro) VALUES
('Admin User', 'admin@comparativa.test', 'hash', 'admin', '2024-01-01 10:00:00'),
('Regular User', 'user@comparativa.test', 'hash', 'user', '2024-01-15 11:30:00');

-- 2. Marcas
INSERT INTO Marca (nombre) VALUES
('Volkswagen'), ('Honda'), ('BMW'), ('Tesla'), ('Peugeot'), ('Toyota'), ('Ford'), ('Cupra'), ('Renault'), ('Hyundai'), ('Mercedes-Benz');

-- 3. Modelos
INSERT INTO Modelo (id_marca, nombre) VALUES
((SELECT id_marca FROM Marca WHERE nombre='Volkswagen'), 'Golf'),
((SELECT id_marca FROM Marca WHERE nombre='Honda'), 'Civic'),
((SELECT id_marca FROM Marca WHERE nombre='BMW'), 'M3'),
((SELECT id_marca FROM Marca WHERE nombre='Tesla'), 'Model 3'),
((SELECT id_marca FROM Marca WHERE nombre='Peugeot'), '3008'),
((SELECT id_marca FROM Marca WHERE nombre='Toyota'), 'GR Yaris'),
((SELECT id_marca FROM Marca WHERE nombre='Ford'), 'Focus'),
((SELECT id_marca FROM Marca WHERE nombre='Cupra'), 'Formentor'),
((SELECT id_marca FROM Marca WHERE nombre='Renault'), 'Espace'),
((SELECT id_marca FROM Marca WHERE nombre='Hyundai'), 'Ioniq 5'),
((SELECT id_marca FROM Marca WHERE nombre='Mercedes-Benz'), 'CLK'),
((SELECT id_marca FROM Marca WHERE nombre='Peugeot'), '206'),
((SELECT id_marca FROM Marca WHERE nombre='Volkswagen'), 'Polo');

-- 4. Generaciones
INSERT INTO Generacion (id_modelo, nombre, anio_inicio, anio_fin) VALUES
((SELECT id_modelo FROM Modelo WHERE nombre='Golf'), 'Mk2', 1984, 1992),
((SELECT id_modelo FROM Modelo WHERE nombre='Civic'), 'FK8', 2017, 2021),
((SELECT id_modelo FROM Modelo WHERE nombre='M3'), 'G80', 2021, NULL),
((SELECT id_modelo FROM Modelo WHERE nombre='Model 3'), '1st Gen', 2017, NULL),
((SELECT id_modelo FROM Modelo WHERE nombre='3008'), 'II', 2016, NULL),
((SELECT id_modelo FROM Modelo WHERE nombre='GR Yaris'), 'XP210', 2020, NULL),
((SELECT id_modelo FROM Modelo WHERE nombre='Focus'), 'Mk4', 2018, NULL),
((SELECT id_modelo FROM Modelo WHERE nombre='Formentor'), '1st Gen', 2020, NULL),
((SELECT id_modelo FROM Modelo WHERE nombre='Espace'), 'V', 2015, NULL),
((SELECT id_modelo FROM Modelo WHERE nombre='Ioniq 5'), '1st Gen', 2021, NULL),
((SELECT id_modelo FROM Modelo WHERE nombre='CLK'), 'C208 Pre-Restyling', 1997, 1999),
((SELECT id_modelo FROM Modelo WHERE nombre='CLK'), 'C208 Restyling', 2000, 2002),
((SELECT id_modelo FROM Modelo WHERE nombre='206'), 'T1 RC', 2003, 2006),
((SELECT id_modelo FROM Modelo WHERE nombre='Polo'), 'VI GTI', 2017, 2020);

-- 5. Motorizaciones
INSERT INTO Motorizacion (id_generacion, codigo_motor, nombre, combustible, potencia, par_motor, cilindrada, num_cilindros, arquitectura, especificaciones) VALUES
((SELECT id_generacion FROM Generacion WHERE nombre='Mk2' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='Golf')), 'PB', '1.8 GTI 8v', 'Gasolina', 112, 159, 1781, 4, 'L4', NULL),
((SELECT id_generacion FROM Generacion WHERE nombre='FK8' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='Civic')), 'K20C1', '2.0 VTEC Turbo', 'Gasolina', 320, 400, 1996, 4, 'L4', NULL),
((SELECT id_generacion FROM Generacion WHERE nombre='G80' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='M3')), 'S58', '3.0 510', 'Gasolina', 510, 650, 2993, 6, 'L6', NULL),
((SELECT id_generacion FROM Generacion WHERE nombre='1st Gen' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='Model 3')), 'LFP', 'Long Range AWD', 'Eléctrico', 498, 493, NULL, NULL, NULL, NULL),
((SELECT id_generacion FROM Generacion WHERE nombre='II' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='3008')), 'EB2ADTS', '1.2 PureTech 130', 'Gasolina', 131, 230, 1199, 3, 'L3', NULL),
((SELECT id_generacion FROM Generacion WHERE nombre='XP210' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='GR Yaris')), 'G16E-GTS', '1.6 Turbo', 'Gasolina', 261, 360, 1618, 3, 'L3', NULL),
((SELECT id_generacion FROM Generacion WHERE nombre='Mk4' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='Focus')), 'M1DA', '1.0 EcoBoost 125', 'Gasolina', 125, 170, 999, 3, 'L3', NULL),
((SELECT id_generacion FROM Generacion WHERE nombre='1st Gen' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='Formentor')), 'DAZA', '2.5 TSI 390', 'Gasolina', 390, 480, 2480, 5, 'L5', NULL),
((SELECT id_generacion FROM Generacion WHERE nombre='V' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='Espace')), 'M9R', '2.0 Blue dCi 200', 'Diésel', 200, 400, 1997, 4, 'L4', NULL),
((SELECT id_generacion FROM Generacion WHERE nombre='1st Gen' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='Ioniq 5')), 'PE', '77.4kWh RWD', 'Eléctrico', 228, 350, NULL, NULL, NULL, NULL),
((SELECT id_generacion FROM Generacion WHERE nombre='C208 Pre-Restyling' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='CLK')), 'M111.975', '230 Kompressor 193cv', 'Gasolina', 193, 280, 2295, 4, 'L4', '{"detalle": "VVT, admisión variable, inyección multipunto"}'),
((SELECT id_generacion FROM Generacion WHERE nombre='C208 Restyling' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='CLK')), 'M111.982', '230 Kompressor 197cv', 'Gasolina', 197, 280, 2295, 4, 'L4', '{"detalle": "VVT, admisión variable, inyección multipunto"}'),
((SELECT id_generacion FROM Generacion WHERE nombre='T1 RC' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='206')), 'EW10J4S', '2.0 16v RC', 'Gasolina', 177, 202, 1997, 4, 'L4', '{"detalle": "VVT, admisión variable, inyección multipunto"}'),
((SELECT id_generacion FROM Generacion WHERE nombre='VI GTI' AND id_modelo=(SELECT id_modelo FROM Modelo WHERE nombre='Polo')), 'DKZC', '2.0 TSI GTI DSG', 'Gasolina', 200, 320, 1984, 4, 'L4 Turbo', '{"detalle": "VVT, admisión variable, inyección multipunto"}');

-- 6. Vehículos (10 ejemplos reales)
INSERT INTO Vehiculo (id_motorizacion, anio, tipo, version, pegatina_ambiental, velocidad_max, aceleracion_0_100, distancia_frenado_100_0, consumo_urbano, consumo_extraurbano, consumo_mixto, emisiones, autonomia_electrica, capacidad_bateria, tiempo_carga_ac, potencia_carga_dc, tiempo_carga_dc_10_80, peso, num_puertas, num_plazas, vol_maletero, vol_maletero_max, dimension_largo, dimension_ancho, dimension_alto, distancia_entre_ejes, traccion, caja_cambios, num_marchas, precio_original, precio_actual_estimado, fecha_lanzamiento) VALUES
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='1.8 GTI 8v'), 1990, 'Hatchback', 'GTI Mk2 8v', 'Sin etiqueta', 191, 10.1, 42.0, 10.5, 6.1, 7.8, 185, NULL, NULL, NULL, NULL, NULL, 960, 3, 5, 345, 1145, 3985, 1665, 1415, 2475, 'Delantera', 'Manual', 5, 15000.00, 42000.00, '1984-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='2.0 VTEC Turbo'), 2020, 'Hatchback', 'Type R FK8', 'C', 272, 5.8, 34.0, 9.5, 6.7, 7.7, 176, NULL, NULL, NULL, NULL, NULL, 1380, 5, 4, 420, 1267, 4557, 1877, 1434, 2700, 'Delantera', 'Manual', 6, 45000.00, 38000.00, '2020-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='3.0 510'), 2022, 'Sedán', 'M3 Competition', 'C', 290, 3.9, 32.0, 13.1, 7.1, 9.6, 221, NULL, NULL, NULL, NULL, NULL, 1730, 4, 5, 480, 1510, 4794, 1903, 1433, 2857, 'Trasera', 'Automática Doble Embrague', 8, 98000.00, 90000.00, '2022-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='Long Range AWD'), 2023, 'Sedán', 'Long Range AWD', '0', 233, 4.4, NULL, NULL, NULL, 16.0, 0, 602, 82, 8.5, 250, 27, 1844, 4, 5, 561, 987, 4694, 1850, 1443, 2875, 'Total', 'Directa Eléctrico', 1, 55000.00, 48000.00, '2023-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='1.2 PureTech 130'), 2021, 'SUV', 'Allure', 'C', 188, 9.5, 36.0, 6.2, 4.7, 5.2, 119, NULL, NULL, NULL, NULL, NULL, 1320, 5, 5, 520, 1482, 4447, 1841, 1620, 2675, 'Delantera', 'Manual', 6, 32000.00, 27000.00, '2021-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='1.6 Turbo'), 2022, 'Hatchback', 'GR Yaris', 'C', 230, 5.5, 33.0, 9.8, 6.5, 7.6, 174, NULL, NULL, NULL, NULL, NULL, 1280, 3, 4, 174, 1410, 3995, 1805, 1455, 2560, 'Total', 'Manual', 6, 39000.00, 35000.00, '2022-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='1.0 EcoBoost 125'), 2021, 'Hatchback', 'ST-Line', 'ECO', 200, 10.0, 38.0, 7.2, 4.5, 5.5, 125, NULL, NULL, NULL, NULL, NULL, 1285, 5, 5, 375, 1354, 4378, 1825, 1454, 2700, 'Delantera', 'Manual', 6, 27000.00, 22000.00, '2021-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='2.5 TSI 390'), 2022, 'SUV', 'VZ5', 'C', 250, 4.2, 31.0, 12.1, 7.8, 9.2, 210, NULL, NULL, NULL, NULL, NULL, 1630, 5, 5, 420, 1475, 4450, 1839, 1510, 2680, 'Total', 'Automática Doble Embrague', 7, 62000.00, 57000.00, '2022-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='2.0 Blue dCi 200'), 2021, 'Monovolumen', 'Blue dCi 200', 'C', 215, 8.8, 36.0, 7.1, 5.2, 6.0, 158, NULL, NULL, NULL, NULL, NULL, 1800, 5, 7, 680, 2101, 4857, 1888, 1677, 2884, 'Delantera', 'Automática Convertidor Par', 6, 48000.00, 42000.00, '2021-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='77.4kWh RWD'), 2023, 'SUV', '77kWh RWD', '0', 185, 7.3, NULL, NULL, NULL, 16.8, 0, 507, 77.4, 6.1, 220, 18, 2100, 5, 5, 527, 1587, 4635, 1890, 1605, 3000, 'Trasera', 'Directa Eléctrico', 1, 48000.00, 42000.00, '2023-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='230 Kompressor 193cv'), 1997, 'Coupé', '230 Kompressor', 'Sin etiqueta', 234, 8.4, NULL, 14.1, 7.3, 9.8, 233, NULL, NULL, NULL, NULL, NULL, 1350, 2, 4, 420, NULL, 4567, 1722, 1371, 2690, 'Trasera', 'Manual', 5, 35000.00, 65000.00, '1997-04-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='230 Kompressor 197cv'), 2000, 'Coupé', '230 Kompressor', 'Sin etiqueta', 235, 7.5, NULL, 13.8, 7.1, 9.2, 220, NULL, NULL, NULL, NULL, NULL, 1345, 2, 4, 420, NULL, 4567, 1722, 1368, 2690, 'Trasera', 'Manual', 6, 38000.00, 67000.00, '2000-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='2.0 16v RC'), 2004, 'Hatchback', 'RC', 'C', 220, 7.4, NULL, 11.8, 6.7, 8.6, 204, NULL, NULL, NULL, NULL, NULL, 1160, 3, 4, 245, 1130, 3835, 1673, 1430, 2442, 'Delantera', 'Manual', 5, 21500.00, 30500.00, '2003-01-01'),
((SELECT id_motorizacion FROM Motorizacion WHERE nombre='2.0 TSI GTI DSG'), 2019, 'Hatchback', 'GTI VI DSG', 'C', 238, 6.7, NULL, 10.4, 6.0, 7.1, 160, NULL, NULL, NULL, NULL, NULL, 1355, 5, 5, 305, 1079, 4067, 1751, 1438, 2549, 'Delantera', 'Automática Doble Embrague', 6, 27780.00, 34300.00, '2017-01-01');

-- 7. Imágenes (rutas locales, ejemplo)
INSERT INTO Imagenes (id_vehiculo, ruta_local, descripcion, orden) VALUES
(1, 'golf_mk2_gti_8v_frontal.jpg', 'Vista frontal', 0),
(2, 'civic_fk8_type_r.jpg', 'Vista frontal', 0),
(3, 'bmw_m3_g80.jpg', 'Vista frontal', 0),
(4, 'tesla_model3_lr.jpg', 'Vista frontal', 0),
(5, 'peugeot_3008_2021.jpg', 'Vista frontal', 0),
(6, 'toyota_gr_yaris.jpg', 'Vista frontal', 0),
(7, 'ford_focus_mk4.jpg', 'Vista frontal', 0),
(8, 'cupra_formentor_vz5.jpg', 'Vista frontal', 0),
(9, 'renault_espace_v.jpg', 'Vista frontal', 0),
(10, 'hyundai_ioniq5.jpg', 'Vista frontal', 0),
(11, 'clk_c208_1997_kompressor.jpg', 'Vista frontal CLK 230 Kompressor 1997', 0),
(12, 'clk_c208_2000_kompressor.jpg', 'Vista frontal CLK 230 Kompressor 2000', 0),
(13, 'peugeot_206_rc.jpg', 'Vista frontal Peugeot 206 RC', 0),
(14, 'vw_polo_gti_vi.jpg', 'Vista frontal VW Polo GTI VI', 0);

SET FOREIGN_KEY_CHECKS=1; 