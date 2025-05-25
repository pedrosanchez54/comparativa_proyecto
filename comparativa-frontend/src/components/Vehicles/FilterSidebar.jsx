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

  // Manejadores específicos para combustible y etiqueta DGT
  const handleCombustibleChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      onFilterChange({}); // Limpiar todos los filtros cuando se selecciona -- Todos --
    } else {
      onFilterChange({ combustible: value }); // Aplicar el filtro seleccionado
    }
  };

  const handlePegatinaChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      onFilterChange({}); // Limpiar todos los filtros cuando se selecciona -- Todos --
    } else {
      onFilterChange({ pegatina_ambiental: value }); // Aplicar el filtro seleccionado
    }
  };

  // Manejador genérico para cambios en inputs y selects de filtros
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const fieldMap = {
      yearMin: 'anioMin',
      yearMax: 'anioMax',
      powerMin: 'potMin',
      powerMax: 'potMax',
      priceMin: 'precioMin',
      priceMax: 'precioMax',
      weightMin: 'pesoMin',
      weightMax: 'pesoMax'
    };
    const backendName = fieldMap[name] || name;
    
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters[backendName];
    } else {
      newFilters[backendName] = value;
    }
    setFilters(newFilters);
  };

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
    
    // Forzar actualización inmediata de los filtros
    const cleanFilters = {};
    onFilterChange(cleanFilters);
  };

  // Manejador para el botón "Limpiar Todo"
  const handleResetFilters = () => {
    // Resetear todos los estados locales
    const defaultSort = { sortBy: 'marca', sortOrder: 'ASC' };
    
    // Limpiar filtros y ordenación
    setFilters({});
    setSort(defaultSort);
    
    // Limpiar selecciones encadenadas
    setSelectedMarca('');
    setSelectedModelo('');
    setSelectedGeneracion('');
    setSelectedMotorizacion('');

    // Forzar la actualización inmediata de todos los filtros
    onFilterChange({});
    handleApplyFilters({ preventDefault: () => {} }); // Forzar aplicación inmediata

    // Actualizar ordenación
    onSortChange(defaultSort.sortBy, defaultSort.sortOrder);
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
    <div className="filter-sidebar card">
      <h4><FaFilter /> Filtrar y Ordenar</h4>
      <form onSubmit={handleApplyFilters}>
        {/* Sección Ordenación */}
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

        {/* Búsqueda por texto */}
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

        {/* Filtro por Marca (Select) */}
        <div className="filter-group">
          <label htmlFor="marca">Marca</label>
          <select id="marca" name="marca" value={selectedMarca} onChange={handleMarcaChange} className="filter-select">
            <option value="">-- Todas --</option>
            {options?.marcas?.map((marca) => (
              <option key={marca.id_marca} value={marca.id_marca}>{marca.nombre}</option>
            ))}
          </select>
        </div>

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

        {/* Filtro por Combustible (Select) */}
        <div className="filter-group">
          <label htmlFor="combustible">Combustible</label>
          <select 
            id="combustible" 
            name="combustible" 
            value={filters.combustible || ''}
            onChange={handleCombustibleChange} 
            className="filter-select"
          >
            <option value="">-- Todos --</option>
            {options?.combustibles?.map((c) => (
              <option key={c} value={c}>{c}</option>
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
            onChange={handlePegatinaChange} 
            className="filter-select"
          >
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
            <input type="number" name="anioMin" placeholder="Min" value={filters.anioMin || ''} onChange={handleInputChange} min="1886" max={new Date().getFullYear()+2} className="filter-input range"/>
            <span>-</span>
            <input type="number" name="anioMax" placeholder="Max" value={filters.anioMax || ''} onChange={handleInputChange} min="1886" max={new Date().getFullYear()+2} className="filter-input range"/>
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

        {/* Botones de Acción */}
        <div className="filter-actions">
          <button type="submit" className="btn btn-primary btn-sm apply-filters-btn">
            <FaFilter /> Aplicar Filtros
          </button>
          <button 
            type="button" 
            onClick={handleResetFilters} 
            className="btn btn-secondary btn-sm reset-filters-btn"
          >
            <FaUndo /> Limpiar Todo
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterSidebar; 