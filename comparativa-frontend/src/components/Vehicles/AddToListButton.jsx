import React from 'react';
import { FaPlusCircle } from 'react-icons/fa'; // Icono de añadir
import { useAuth } from '../../contexts/AuthContext'; // Para verificar login
import { toast } from 'react-toastify'; // Para notificaciones
import { useNavigate, useLocation } from 'react-router-dom'; // Para redirigir

/**
 * Botón para añadir un vehículo a una lista del usuario.
 * IMPORTANTE: Esta es una versión Placeholder. La funcionalidad real
 * requeriría implementar un Modal o Dropdown para seleccionar la lista.
 * @param {object} props - Propiedades.
 * @param {number} props.vehicleId - El ID del vehículo.
 */
const AddToListButton = ({ vehicleId }) => {
    const { isLoggedIn } = useAuth(); // Verifica si el usuario está logueado
    const navigate = useNavigate();
    const location = useLocation();

     // Manejador del click en el botón
     const handleClick = (e) => {
        e.preventDefault(); // Prevenir acción del padre (ej. Link)
        e.stopPropagation(); // Detener propagación

         // Si no está logueado, redirigir a login
         if (!isLoggedIn) {
            toast.info('Debes iniciar sesión para añadir vehículos a listas.');
             navigate('/login', { state: { from: location } });
            return;
         }

         // --- Lógica para el Modal/Dropdown iría aquí ---
         // 1. Abrir un componente Modal o un Dropdown.
         // 2. Dentro del Modal/Dropdown:
         //    a. Hacer una llamada API a `GET /api/lists` para obtener las listas del usuario.
         //    b. Mostrar las listas (ej. en un select o lista clickeable).
         //    c. Opcional: Permitir crear una nueva lista desde aquí.
         // 3. Al seleccionar una lista:
         //    a. Obtener el `idLista` seleccionado.
         //    b. Hacer una llamada API `POST /api/lists/:idLista/vehicles/:vehicleId`.
         //    c. Cerrar el Modal/Dropdown.
         //    d. Mostrar notificación de éxito (toast).
         // 4. Manejar errores en las llamadas API (mostrar toast de error).
         // -------------------------------------------------

         // Mensaje placeholder actual:
         toast.info(`FUNCIONALIDAD PENDIENTE: Añadir vehículo ${vehicleId} a una lista.`);
         console.log(`TODO: Implementar modal/dropdown para añadir vehículo ${vehicleId} a lista.`);
     };

    // Renderizar el botón (solo se muestra si está logueado, o redirige)
    return (
        <button className="btn btn-outline-secondary btn-sm" disabled title="Añadir a lista (no implementado)">
            ➕
        </button>
    );
};

export default AddToListButton; 