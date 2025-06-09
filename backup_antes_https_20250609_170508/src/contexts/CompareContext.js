import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]); // [{id, marca, modelo, version, imagen, ...}]

  // Añadir vehículo (si no está y hay menos de 6)
  const addVehicle = (vehicle) => {
    if (compareList.length >= 6) return;
    if (!compareList.find(v => v.id_vehiculo === vehicle.id_vehiculo)) {
      setCompareList([...compareList, vehicle]);
    }
  };

  // Quitar vehículo
  const removeVehicle = (id_vehiculo) => {
    setCompareList(compareList.filter(v => v.id_vehiculo !== id_vehiculo));
  };

  // Vaciar lista
  const clearCompare = () => setCompareList([]);

  // Comprobar si está añadido
  const isInCompare = (id_vehiculo) => compareList.some(v => v.id_vehiculo === id_vehiculo);

  return (
    <CompareContext.Provider value={{
      compareList,
      addVehicle,
      removeVehicle,
      clearCompare,
      isInCompare
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
} 