-- Script de actualización para añadir rutas de imágenes reales a vehículos existentes
-- Fecha: 2024
-- Actualiza los vehículos BMW M3, Cupra Formentor VZ5 y Ford Focus ST-Line

USE comparativa_vehiculos;

-- Actualizar imagen del BMW M3 G80 (id_vehiculo = 3)
UPDATE Imagenes 
SET ruta_local = 'M3_G80.png', 
    descripcion = 'Vista frontal BMW M3 G80 Competition'
WHERE id_vehiculo = 3;

-- Actualizar imagen del Cupra Formentor VZ5 (id_vehiculo = 8)
UPDATE Imagenes 
SET ruta_local = 'Formentor_VZ5.png', 
    descripcion = 'Vista frontal Cupra Formentor VZ5'
WHERE id_vehiculo = 8;

-- Actualizar imagen del Ford Focus ST-Line (id_vehiculo = 7)
UPDATE Imagenes 
SET ruta_local = 'Focus_ST_line.png', 
    descripcion = 'Vista frontal Ford Focus ST-Line'
WHERE id_vehiculo = 7;

-- Verificar las actualizaciones
SELECT 
    v.id_vehiculo,
    CONCAT(ma.nombre, ' ', mo.nombre) as vehiculo,
    v.version,
    i.ruta_local,
    i.descripcion
FROM Vehiculo v
JOIN Motorizacion mot ON v.id_motorizacion = mot.id_motorizacion
JOIN Generacion g ON mot.id_generacion = g.id_generacion
JOIN Modelo mo ON g.id_modelo = mo.id_modelo
JOIN Marca ma ON mo.id_marca = ma.id_marca
LEFT JOIN Imagenes i ON v.id_vehiculo = i.id_vehiculo
WHERE v.id_vehiculo IN (3, 7, 8)
ORDER BY v.id_vehiculo; 