import React, { useState, useEffect } from 'react';
import { FaFilter, FaSortAmountDown, FaSortAmountUp, FaUndo } from 'react-icons/fa';
import './FilterSidebar.css'; // Importa los estilos

/**
 * Componente de barra lateral para filtrar y ordenar la lista de vehículos.
 * @param {object} props - Propiedades.
 * @param {object|null} props.options - Objeto con arrays de opciones para los selects (marcas, tipos, etc.).
 * @param {object} props.initialFilters - Objeto con los filtros y ordenación actuales (leídos de URLSearchParams).
 * @param {function} props.onFilterChange - Callback que se ejecuta al aplicar filtros (recibe objeto con nuevos filtros).
 * @param {function} props.onSortChange - Callback que se ejecuta al cambiar la ordenación (recibe sortBy, sortOrder).
 */
const FilterSidebar = ({ options, initialFilters, onFilterChange, onSortChange }) => {
<<<<<<< HEAD
  const [filters, setFilters] = useState(initialFilters || {});
  const [sort, setSort] = useState({
    sortBy: initialFilters?.sortBy || 'marca',
    sortOrder: initialFilters?.sortOrder || 'ASC'
  });

  useEffect(() => {
    setFilters(initialFilters || {});
  }, [initialFilters]);

=======
  // Estado local para manejar los valores de los filtros mientras el usuario interactúa
  const [filters, setFilters] = useState(initialFilters || {});
  // Estado local para la ordenación
  const [sort, setSort] = useState({
    sortBy: initialFilters?.sortBy || 'marca', // Campo por defecto para ordenar
    sortOrder: initialFilters?.sortOrder || 'ASC' // Orden por defecto
  });

  // NUEVO: Filtros encadenados por IDs
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [selectedGeneracion, setSelectedGeneracion] = useState('');
  const [selectedMotorizacion, setSelectedMotorizacion] = useState('');

  // Filtrar modelos según marca seleccionada
  const modelosFiltrados = options?.modelos?.filter(m => m.id_marca === parseInt(selectedMarca)) || [];
  // Filtrar generaciones según modelo seleccionada
  const generacionesFiltradas = options?.generaciones?.filter(g => g.id_modelo === parseInt(selectedModelo)) || [];
  // Filtrar motorizaciones según generación seleccionada
  const motorizacionesFiltradas = options?.motorizaciones?.filter(mt => mt.id_generacion === parseInt(selectedGeneracion)) || [];

  // Sincronizar estado local si los filtros iniciales cambian (ej. navegación atrás/adelante)
  useEffect(() => {
      // Solo actualiza si los filtros iniciales son realmente diferentes a los actuales
      // para evitar re-renders innecesarios. Una comparación profunda sería más robusta.
      if (JSON.stringify(initialFilters) !== JSON.stringify(filters)) {
          setFilters(initialFilters || {});
      }
      const initialSortBy = initialFilters?.sortBy || 'marca';
      const initialSortOrder = initialFilters?.sortOrder || 'ASC';
      if (sort.sortBy !== initialSortBy || sort.sortOrder !== initialSortOrder) {
          setSort({ sortBy: initialSortBy, sortOrder: initialSortOrder });
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilters]); // Dependencia de los filtros iniciales


  // Manejador genérico para cambios en inputs y selects de filtros
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

<<<<<<< HEAD
  const handleSortSelectChange = (e) => {
    const { name, value } = e.target;
    const newSort = { ...sort, [name]: value };
    setSort(newSort);
    onSortChange(newSort.sortBy, newSort.sortOrder);
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const cleanFilters = { ...filters };
    
    // Limpiar valores vacíos
    Object.keys(cleanFilters).forEach(key => {
      if (cleanFilters[key] === '' || cleanFilters[key] === null || cleanFilters[key] === undefined) {
        delete cleanFilters[key];
      }
    });

    onFilterChange(cleanFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    const defaultSort = { sortBy: 'marca', sortOrder: 'ASC' };
    setSort(defaultSort);
    onFilterChange({});
    onSortChange(defaultSort.sortBy, defaultSort.sortOrder);
  };

  return (
    <div className="filter-sidebar card">
      <h4><FaFilter /> Filtrar y Ordenar</h4>
      <form onSubmit={handleApplyFilters}>
        {/* Sección Ordenación */}
        <div className="filter-group sort-group">
          <label htmlFor="sortBy">Ordenar por:</label>
          <div className='sort-controls'>
            <select 
              name="sortBy" 
              id="sortBy" 
              value={sort.sortBy} 
              onChange={handleSortSelectChange}
            >
              <option value="marca">Marca</option>
              <option value="modelo">Modelo</option>
              <option value="anio">Año</option>
              <option value="potencia">Potencia (CV)</option>
              <option value="precio_original">Precio</option>
            </select>
            <button
              type="button"
              onClick={() => handleSortSelectChange({ 
                target: { 
                  name: 'sortOrder', 
                  value: sort.sortOrder === 'ASC' ? 'DESC' : 'ASC' 
                }
              })}
              className="btn-sort-toggle"
              title={`Cambiar a orden ${sort.sortOrder === 'ASC' ? 'Descendente' : 'Ascendente'}`}
            >
              {sort.sortOrder === 'ASC' ? <FaSortAmountDown /> : <FaSortAmountUp />}
            </button>
          </div>
        </div>

        {/* Búsqueda por texto */}
=======
  // Manejador para cambios en los selects de ordenación
  const handleSortSelectChange = (e) => {
    const { name, value } = e.target;
     const newSort = { ...sort, [name]: value };
    setSort(newSort);
     // Aplicar la ordenación inmediatamente al cambiar el select
     onSortChange(newSort.sortBy, newSort.sortOrder);
  };

  // Manejador para el botón "Aplicar Filtros"
  const handleApplyFilters = (e) => {
    e.preventDefault(); // Prevenir recarga de página si estuviera en un form real
    // Limpiar filtros numéricos que estén vacíos o sean inválidos antes de enviar
    const cleanFilters = { ...filters };
    const numericRangeKeys = ['añoMin', 'añoMax', 'potMin', 'potMax', 'precioMin', 'precioMax', 'pesoMin', 'pesoMax']; // Añadir más si es necesario
    numericRangeKeys.forEach(key => {
        if (cleanFilters[key] !== undefined && (cleanFilters[key] === '' || parseFloat(cleanFilters[key]) < 0)) {
            // Si está vacío o es negativo (asumiendo que no hay valores negativos válidos), eliminarlo
            delete cleanFilters[key];
        }
    });
    // Llamar al callback pasado por props para actualizar los searchParams en la página padre
    onFilterChange(cleanFilters);
  };

   // Manejador para el botón "Limpiar Todo"
   const handleResetFilters = () => {
       const defaultSort = { sortBy: 'marca', sortOrder: 'ASC' };
       setFilters({}); // Limpiar estado local de filtros
       setSort(defaultSort); // Resetear estado local de ordenación
       // Llamar a los callbacks para limpiar los searchParams en la página padre
       onFilterChange({}); // Objeto vacío indica limpiar todos los filtros
       onSortChange(defaultSort.sortBy, defaultSort.sortOrder); // Resetear ordenación
   };

  // Manejadores de cambio
  const handleMarcaChange = (e) => {
    setSelectedMarca(e.target.value);
    setSelectedModelo('');
    setSelectedGeneracion('');
    setSelectedMotorizacion('');
    onFilterChange({ id_marca: e.target.value });
  };
  const handleModeloChange = (e) => {
    setSelectedModelo(e.target.value);
    setSelectedGeneracion('');
    setSelectedMotorizacion('');
    onFilterChange({ id_modelo: e.target.value });
  };
  const handleGeneracionChange = (e) => {
    setSelectedGeneracion(e.target.value);
    setSelectedMotorizacion('');
    onFilterChange({ id_generacion: e.target.value });
  };
  const handleMotorizacionChange = (e) => {
    setSelectedMotorizacion(e.target.value);
    onFilterChange({ id_motorizacion: e.target.value });
  };

  // Opciones disponibles para ordenar (coinciden con allowedSortBy en backend)
  const sortOptions = [
    { value: 'marca', label: 'Marca' },
    { value: 'modelo', label: 'Modelo' },
    { value: 'año', label: 'Año' },
    { value: 'potencia', label: 'Potencia (CV)' },
    { value: 'precio_original', label: 'Precio Original' },
    { value: 'precio_actual_estimado', label: 'Precio Estimado' },
    { value: 'peso', label: 'Peso (kg)' },
    { value: 'aceleracion_0_100', label: 'Aceleración (0-100)' },
    { value: 'velocidad_max', label: 'Velocidad Máx.' },
    { value: 'emisiones', label: 'Emisiones CO2' },
    { value: 'fecha_actualizacion', label: 'Actualizado Recientemente' },
    { value: 'fecha_creacion', label: 'Añadido Recientemente' },
  ];

  return (
    <div className="filter-sidebar card"> {/* Usa clase 'card' global */}
      <h4><FaFilter /> Filtrar y Ordenar</h4>
      <form onSubmit={handleApplyFilters}>

         {/* --- Sección Ordenación --- */}
         <div className="filter-group sort-group">
             <label htmlFor="sortBy">Ordenar por:</label>
             <div className='sort-controls'>
                <select name="sortBy" id="sortBy" value={sort.sortBy} onChange={handleSortSelectChange}>
                    {sortOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => handleSortSelectChange({ target: { name: 'sortOrder', value: sort.sortOrder === 'ASC' ? 'DESC' : 'ASC' } })}
                    className="btn-sort-toggle"
                    title={`Cambiar a orden ${sort.sortOrder === 'ASC' ? 'Descendente' : 'Ascendente'}`}
                >
                    {sort.sortOrder === 'ASC' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                </button>
             </div>
         </div>


        {/* --- Sección Filtros --- */}
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
        <div className="filter-group">
          <label htmlFor="searchText">Búsqueda por texto</label>
          <input
            type="text"
            id="searchText"
            name="searchText"
            placeholder="Marca, modelo, versión..."
            value={filters.searchText || ''}
            onChange={handleInputChange}
            className="filter-input"
          />
        </div>

<<<<<<< HEAD
        {/* Filtro por Marca */}
        <div className="filter-group">
          <label htmlFor="marca">Marca</label>
          <select
            id="marca"
            name="marca"
            value={filters.marca || ''}
            onChange={handleInputChange}
            className="filter-select"
          >
            <option value="">-- Todas --</option>
            {options?.marcas?.map(marca => (
              <option key={marca.id_marca} value={marca.id_marca}>
                {marca.nombre}
              </option>
=======
        {/* Filtro por Marca (Select) */}
        <div className="filter-group">
          <label htmlFor="marca">Marca</label>
          <select id="marca" name="marca" value={selectedMarca} onChange={handleMarcaChange} className="filter-select">
            <option value="">-- Todas --</option>
            {options?.marcas?.map((marca) => (
              <option key={marca.id_marca} value={marca.id_marca}>{marca.nombre}</option>
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
            ))}
          </select>
        </div>

<<<<<<< HEAD
        {/* Filtro por Combustible */}
        <div className="filter-group">
          <label htmlFor="combustible">Combustible</label>
          <select
            id="combustible"
            name="combustible"
            value={filters.combustible || ''}
            onChange={handleInputChange}
            className="filter-select"
          >
            <option value="">-- Todos --</option>
            {options?.combustibles?.map(combustible => (
              <option key={combustible} value={combustible}>
                {combustible}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Etiqueta DGT */}
        <div className="filter-group">
          <label htmlFor="pegatina_ambiental">Etiqueta DGT</label>
          <select
            id="pegatina_ambiental"
            name="pegatina_ambiental"
            value={filters.pegatina_ambiental || ''}
            onChange={handleInputChange}
            className="filter-select"
          >
            <option value="">-- Todas --</option>
            <option value="0">0 Emisiones</option>
            <option value="ECO">ECO</option>
            <option value="C">C</option>
            <option value="B">B</option>
            <option value="Sin etiqueta">Sin etiqueta</option>
          </select>
        </div>

        {/* Rango de Años */}
        <div className="filter-group">
          <label>Año</label>
          <div className="range-inputs">
            <input
              type="number"
              name="anioMin"
              placeholder="Desde"
              value={filters.anioMin || ''}
              onChange={handleInputChange}
              className="filter-input"
              min="1900"
              max={new Date().getFullYear()}
            />
            <input
              type="number"
              name="anioMax"
              placeholder="Hasta"
              value={filters.anioMax || ''}
              onChange={handleInputChange}
              className="filter-input"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        {/* Rango de Potencia */}
        <div className="filter-group">
          <label>Potencia (CV)</label>
          <div className="range-inputs">
            <input
              type="number"
              name="potenciaMin"
              placeholder="Mín"
              value={filters.potenciaMin || ''}
              onChange={handleInputChange}
              className="filter-input"
              min="0"
            />
            <input
              type="number"
              name="potenciaMax"
              placeholder="Máx"
              value={filters.potenciaMax || ''}
              onChange={handleInputChange}
              className="filter-input"
              min="0"
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="filter-actions">
          <button type="submit" className="btn btn-primary">
            <FaFilter /> Aplicar Filtros
          </button>
          <button type="button" onClick={handleResetFilters} className="btn btn-secondary">
            <FaUndo /> Limpiar Todo
          </button>
=======
        {/* Filtro por Modelo (Select) */}
        {selectedMarca && (
          <div className="filter-group">
            <label htmlFor="modelo">Modelo</label>
            <select id="modelo" name="modelo" value={selectedModelo} onChange={handleModeloChange} className="filter-select">
              <option value="">-- Todos --</option>
              {modelosFiltrados.map((modelo) => (
                <option key={modelo.id_modelo} value={modelo.id_modelo}>{modelo.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro por Generación (Select) */}
        {selectedModelo && (
          <div className="filter-group">
            <label htmlFor="generacion">Generación</label>
            <select id="generacion" name="generacion" value={selectedGeneracion} onChange={handleGeneracionChange} className="filter-select">
              <option value="">-- Todas --</option>
              {generacionesFiltradas.map((gen) => (
                <option key={gen.id_generacion} value={gen.id_generacion}>{gen.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro por Motorización (Select) */}
        {selectedGeneracion && (
          <div className="filter-group">
            <label htmlFor="motorizacion">Motorización</label>
            <select id="motorizacion" name="motorizacion" value={selectedMotorizacion} onChange={handleMotorizacionChange} className="filter-select">
              <option value="">-- Todas --</option>
              {motorizacionesFiltradas.map((mt) => (
                <option key={mt.id_motorizacion} value={mt.id_motorizacion}>{mt.nombre} ({mt.codigo_motor})</option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro por Tipo (Select) */}
        <div className="filter-group">
           <label htmlFor="tipo">Tipo</label>
           <select id="tipo" name="tipo" value={filters.tipo || ''} onChange={handleInputChange} className="filter-select">
             <option value="">-- Todos --</option>
             {options?.tipos?.map((tipo) => (
               <option key={tipo} value={tipo}>{tipo}</option>
             ))}
           </select>
        </div>

        {/* Filtro por Combustible (Select) */}
         <div className="filter-group">
           <label htmlFor="combustible">Combustible</label>
           <select id="combustible" name="combustible" value={filters.combustible || ''} onChange={handleInputChange} className="filter-select">
             <option value="">-- Todos --</option>
             {options?.combustibles?.map((c) => (
               <option key={c} value={c}>{c}</option>
             ))}
           </select>
        </div>

        {/* Filtro por Etiqueta DGT (Select) */}
         <div className="filter-group">
           <label htmlFor="pegatina_ambiental">Etiqueta DGT</label>
           <select id="pegatina_ambiental" name="pegatina_ambiental" value={filters.pegatina_ambiental || ''} onChange={handleInputChange} className="filter-select">
             <option value="">-- Todas --</option>
             {options?.pegatinas?.map((p) => (
               <option key={p} value={p}>{p}</option>
             ))}
           </select>
        </div>

         {/* Filtros de Rango (Año, Potencia, Precio, etc.) */}
         <div className="filter-group range-filter">
            <label>Año</label>
             <div className='range-inputs'>
                <input type="number" name="añoMin" placeholder="Min" value={filters.añoMin || ''} onChange={handleInputChange} min="1886" max={new Date().getFullYear()+2} className="filter-input range"/>
                <span>-</span>
                <input type="number" name="añoMax" placeholder="Max" value={filters.añoMax || ''} onChange={handleInputChange} min="1886" max={new Date().getFullYear()+2} className="filter-input range"/>
            </div>
         </div>
         <div className="filter-group range-filter">
            <label>Potencia (CV)</label>
             <div className='range-inputs'>
                <input type="number" name="potMin" placeholder="Min" value={filters.potMin || ''} onChange={handleInputChange} min="0" className="filter-input range"/>
                <span>-</span>
                <input type="number" name="potMax" placeholder="Max" value={filters.potMax || ''} onChange={handleInputChange} min="0" className="filter-input range"/>
            </div>
         </div>
         <div className="filter-group range-filter">
            <label>Precio Original (€)</label>
             <div className='range-inputs'>
                <input type="number" name="precioMin" placeholder="Min" value={filters.precioMin || ''} onChange={handleInputChange} min="0" step="100" className="filter-input range"/>
                <span>-</span>
                <input type="number" name="precioMax" placeholder="Max" value={filters.precioMax || ''} onChange={handleInputChange} min="0" step="100" className="filter-input range"/>
            </div>
         </div>
         {/* Añadir más filtros de rango aquí si es necesario (peso, emisiones...) */}


        {/* --- Botones de Acción --- */}
        <div className="filter-actions">
            {/* Botón para aplicar los filtros seleccionados */}
            <button type="submit" className="btn btn-primary btn-sm apply-filters-btn">
                <FaFilter /> Aplicar Filtros
            </button>
            {/* Botón para limpiar todos los filtros y la ordenación */}
            <button type="button" onClick={handleResetFilters} className="btn btn-secondary btn-sm reset-filters-btn">
                <FaUndo /> Limpiar Todo
            </button>
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
        </div>
      </form>
    </div>
  );
};

export default FilterSidebar; 