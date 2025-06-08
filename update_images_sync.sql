-- Script para sincronizar imágenes de vehículos
-- Actualiza las rutas en la base de datos para que coincidan con los archivos físicos
-- Fecha: $(date)

USE comparativa_vehiculos;

-- Verificar estado actual
SELECT 'ESTADO ANTES DE LA ACTUALIZACIÓN' as status;
SELECT v.id_vehiculo, 
       CONCAT(ma.nombre, ' ', mo.nombre, ' ', v.version) as vehiculo, 
       i.ruta_local 
FROM Vehiculo v 
JOIN Motorizacion mot ON v.id_motorizacion = mot.id_motorizacion 
JOIN Generacion g ON mot.id_generacion = g.id_generacion 
JOIN Modelo mo ON g.id_modelo = mo.id_modelo 
JOIN Marca ma ON mo.id_marca = ma.id_marca 
LEFT JOIN Imagenes i ON v.id_vehiculo = i.id_vehiculo 
ORDER BY v.id_vehiculo;

-- Actualizar imágenes existentes con nombres correctos
UPDATE Imagenes SET ruta_local = 'Golf_GTI_MK2_8v.png' WHERE id_vehiculo = 1;
UPDATE Imagenes SET ruta_local = 'Type_R_FK8.png' WHERE id_vehiculo = 2;
-- BMW M3 ya está correcto (M3_G80.png)
UPDATE Imagenes SET ruta_local = 'Model_3_Long_Range_AWD.png' WHERE id_vehiculo = 4;
UPDATE Imagenes SET ruta_local = '3008_2021.png' WHERE id_vehiculo = 5;
UPDATE Imagenes SET ruta_local = 'GR_Yaris_261cv.png' WHERE id_vehiculo = 6;
-- Ford Focus ya está correcto (Focus_ST_line.png)
-- Cupra Formentor ya está correcto (Formentor_VZ5.png)
UPDATE Imagenes SET ruta_local = 'renault-espace-2020-1600.jpg' WHERE id_vehiculo = 9;
UPDATE Imagenes SET ruta_local = 'Hyundai_IONIQ_5.png' WHERE id_vehiculo = 10;
UPDATE Imagenes SET ruta_local = 'CLK_KOMPRESSOR_1997_193cv.png' WHERE id_vehiculo = 11;
UPDATE Imagenes SET ruta_local = 'CLK_KOMPRESSOR_2000_197cv.png' WHERE id_vehiculo = 12;
UPDATE Imagenes SET ruta_local = '206_RC.png' WHERE id_vehiculo = 13;
UPDATE Imagenes SET ruta_local = 'Polo_GTI_200cv.png' WHERE id_vehiculo = 14;

-- Verificar resultado
SELECT 'ESTADO DESPUÉS DE LA ACTUALIZACIÓN' as status;
SELECT v.id_vehiculo, 
       CONCAT(ma.nombre, ' ', mo.nombre, ' ', v.version) as vehiculo, 
       i.ruta_local 
FROM Vehiculo v 
JOIN Motorizacion mot ON v.id_motorizacion = mot.id_motorizacion 
JOIN Generacion g ON mot.id_generacion = g.id_generacion 
JOIN Modelo mo ON g.id_modelo = mo.id_modelo 
JOIN Marca ma ON mo.id_marca = ma.id_marca 
LEFT JOIN Imagenes i ON v.id_vehiculo = i.id_vehiculo 
ORDER BY v.id_vehiculo;

-- Mostrar resumen
SELECT 'RESUMEN DE ACTUALIZACIONES' as status;
SELECT COUNT(*) as total_imagenes_actualizadas FROM Imagenes; 