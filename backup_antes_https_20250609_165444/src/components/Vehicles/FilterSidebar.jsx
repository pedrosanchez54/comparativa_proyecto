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
  const [filters, setFilters] = useState(() => {
    // Inicializar con valores por defecto para todos los campos
    const defaultFilters = {
      searchText: '',
      combustible: '',
      tipo: '',
      pegatina_ambiental: '',
      traccion: '',
      caja_cambios: '',
      anioMin: '',
      anioMax: '',
      potMin: '',
      potMax: '',
      precioMin: '',
      precioMax: '',
      pesoMin: '',
      pesoMax: ''
    };
    
    // Sobrescribir con los valores iniciales si existen
    return { ...defaultFilters, ...(initialFilters || {}) };
  });
  // Estado local para la ordenación
  const [sort, setSort] = useState({
    sortBy: initialFilters?.sortBy || 'm.nombre', // Campo por defecto para ordenar
    sortOrder: initialFilters?.sortOrder || 'ASC' // Orden por defecto
  });

  // NUEVO: Estado para forzar re-renderizado cuando sea necesario
  const [resetKey, setResetKey] = useState(0);

  // NUEVO: Filtros encadenados por IDs
  const [selectedMarca, setSelectedMarca] = useState(initialFilters?.id_marca || '');
  const [selectedModelo, setSelectedModelo] = useState(initialFilters?.id_modelo || '');
  const [selectedGeneracion, setSelectedGeneracion] = useState(initialFilters?.id_generacion || '');
  const [selectedMotorizacion, setSelectedMotorizacion] = useState(initialFilters?.id_motorizacion || '');

  // Filtrar modelos según marca seleccionada
  const modelosFiltrados = options?.modelos?.filter(m => m.id_marca === parseInt(selectedMarca)) || [];
  // Filtrar generaciones según modelo seleccionada
  const generacionesFiltradas = options?.generaciones?.filter(g => g.id_modelo === parseInt(selectedModelo)) || [];
  // Filtrar motorizaciones según generación seleccionada
  const motorizacionesFiltradas = options?.motorizaciones?.filter(mt => mt.id_generacion === parseInt(selectedGeneracion)) || [];

  // Sincronizar estado local si los filtros iniciales cambian (ej. navegación atrás/adelante)
  useEffect(() => {
    const defaultFilters = {
      searchText: '',
      combustible: '',
      tipo: '',
      pegatina_ambiental: '',
      traccion: '',
      caja_cambios: '',
      anioMin: '',
      anioMax: '',
      potMin: '',
      potMax: '',
      precioMin: '',
      precioMax: '',
      pesoMin: '',
      pesoMax: ''
    };
    
    const newFilters = { ...defaultFilters, ...(initialFilters || {}) };
    
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      setFilters(newFilters);
      setSelectedMarca(initialFilters?.id_marca || '');
      setSelectedModelo(initialFilters?.id_modelo || '');
      setSelectedGeneracion(initialFilters?.id_generacion || '');
      setSelectedMotorizacion(initialFilters?.id_motorizacion || '');
    }
    const initialSortBy = initialFilters?.sortBy || 'm.nombre';
    const initialSortOrder = initialFilters?.sortOrder || 'ASC';
    if (sort.sortBy !== initialSortBy || sort.sortOrder !== initialSortOrder) {
      setSort({ sortBy: initialSortBy, sortOrder: initialSortOrder });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilters]); // Dependencia de los filtros iniciales

  // Función para aplicar filtros inmediatamente
  const applyFiltersImmediately = (newFilters, newSelectedMarca = selectedMarca, newSelectedModelo = selectedModelo, newSelectedGeneracion = selectedGeneracion, newSelectedMotorizacion = selectedMotorizacion) => {
    // Crear objeto de filtros limpio (sin valores vacíos)
    const cleanFilters = {};
    Object.keys(newFilters).forEach(key => {
      const value = newFilters[key];
      if (value !== '' && value !== null && value !== undefined) {
        cleanFilters[key] = value;
      }
    });

    // Agregar filtros de selección encadenada
    if (newSelectedMarca) cleanFilters.id_marca = newSelectedMarca;
    if (newSelectedModelo) cleanFilters.id_modelo = newSelectedModelo;
    if (newSelectedGeneracion) cleanFilters.id_generacion = newSelectedGeneracion;
    if (newSelectedMotorizacion) cleanFilters.id_motorizacion = newSelectedMotorizacion;
    
    // Aplicar filtros inmediatamente
    onFilterChange(cleanFilters);
  };

  // Manejador genérico para cambios en inputs de rango (NO se aplican inmediatamente)
  const handleRangeInputChange = (e) => {
    const { name, value } = e.target;
    
    const newFilters = { ...filters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[name];
    } else {
      newFilters[name] = value;
    }
    setFilters(newFilters);
    // NO aplicar inmediatamente para filtros de rango
  };

  // Manejador genérico para filtros categóricos (SE APLICAN INMEDIATAMENTE)
  const handleCategoricalFilterChange = (e) => {
    const { name, value } = e.target;
    
    const newFilters = { ...filters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[name];
    } else {
      newFilters[name] = value;
    }
    setFilters(newFilters);
    
    // Aplicar inmediatamente para filtros categóricos
    applyFiltersImmediately(newFilters);
  };

  // Manejador para búsqueda por texto (SE APLICA INMEDIATAMENTE)
  const handleSearchTextChange = (e) => {
    const { name, value } = e.target;
    
    const newFilters = { ...filters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[name];
    } else {
      newFilters[name] = value;
    }
    setFilters(newFilters);
    
    // Aplicar inmediatamente
    applyFiltersImmediately(newFilters);
  };

  // Manejador para cambios en los selects de ordenación
  const handleSortSelectChange = (e) => {
    const { name, value } = e.target;
    const newSort = { ...sort, [name]: value };
    setSort(newSort);
    // Aplicar la ordenación inmediatamente al cambiar el select
    onSortChange(newSort.sortBy, newSort.sortOrder);
  };

  // Manejador para el botón "Aplicar Filtros" (solo para rangos)
  const handleApplyFilters = (e) => {
    e.preventDefault(); // Prevenir recarga de página si estuviera en un form real
    
    // Aplicar todos los filtros incluyendo los rangos
    applyFiltersImmediately(filters);
  };

  // Manejador para el botón "Limpiar Todo" - RESETEO COMPLETO
  const handleResetFilters = () => {
    console.log('🧹 Iniciando reseteo completo de filtros');
    
    // Resetear TODOS los estados locales completamente a valores vacíos
    const emptyFilters = {
      searchText: '',
      combustible: '',
      tipo: '',
      pegatina_ambiental: '',
      traccion: '',
      caja_cambios: '',
      anioMin: '',
      anioMax: '',
      potMin: '',
      potMax: '',
      precioMin: '',
      precioMax: '',
      pesoMin: '',
      pesoMax: ''
    };
    const defaultSort = { sortBy: 'm.nombre', sortOrder: 'ASC' };
    
    // Paso 1: Limpiar estados inmediatamente
    setFilters(emptyFilters);
    setSort(defaultSort);
    setSelectedMarca('');
    setSelectedModelo('');
    setSelectedGeneracion('');
    setSelectedMotorizacion('');

    // Paso 2: Forzar re-renderizado visual
    setResetKey(prev => prev + 1);
    
    // Paso 3: Aplicar filtros vacíos INMEDIATAMENTE
    console.log('🔄 Aplicando filtros vacíos');
    onFilterChange({});
    
    // Paso 4: Aplicar ordenación por defecto
    onSortChange(defaultSort.sortBy, defaultSort.sortOrder);
    
    // Paso 5: Verificación final tras re-renderizado
    setTimeout(() => {
      console.log('✅ Verificación final del reseteo');
      setFilters({ ...emptyFilters });
      setSelectedMarca('');
      setSelectedModelo('');
      setSelectedGeneracion('');
      setSelectedMotorizacion('');
    }, 150);
  };

  // Manejadores de cambio para filtros encadenados (SE APLICAN INMEDIATAMENTE)
  const handleMarcaChange = (e) => {
    const value = e.target.value;
    setSelectedMarca(value);
    setSelectedModelo('');
    setSelectedGeneracion('');
    setSelectedMotorizacion('');
    
    // Limpiar filtros relacionados
    const newFilters = { ...filters };
    delete newFilters.id_marca;
    delete newFilters.id_modelo;
    delete newFilters.id_generacion;
    delete newFilters.id_motorizacion;
    setFilters(newFilters);
    
    // Aplicar inmediatamente
    applyFiltersImmediately(newFilters, value, '', '', '');
  };

  const handleModeloChange = (e) => {
    const value = e.target.value;
    setSelectedModelo(value);
    setSelectedGeneracion('');
    setSelectedMotorizacion('');
    
    const newFilters = { ...filters };
    delete newFilters.id_modelo;
    delete newFilters.id_generacion;
    delete newFilters.id_motorizacion;
    setFilters(newFilters);
    
    // Aplicar inmediatamente
    applyFiltersImmediately(newFilters, selectedMarca, value, '', '');
  };

  const handleGeneracionChange = (e) => {
    const value = e.target.value;
    setSelectedGeneracion(value);
    setSelectedMotorizacion('');
    
    const newFilters = { ...filters };
    delete newFilters.id_generacion;
    delete newFilters.id_motorizacion;
    setFilters(newFilters);
    
    // Aplicar inmediatamente
    applyFiltersImmediately(newFilters, selectedMarca, selectedModelo, value, '');
  };

  const handleMotorizacionChange = (e) => {
    const value = e.target.value;
    setSelectedMotorizacion(value);
    
    const newFilters = { ...filters };
    delete newFilters.id_motorizacion;
    setFilters(newFilters);
    
    // Aplicar inmediatamente
    applyFiltersImmediately(newFilters, selectedMarca, selectedModelo, selectedGeneracion, value);
  };

  // Opciones disponibles para ordenar (coinciden con allowedSortBy en backend)
  const sortOptions = [
    { value: 'm.nombre', label: 'Marca' },
    { value: 'mo.nombre', label: 'Modelo' },
    { value: 'v.anio', label: 'Año' },
    { value: 'mt.potencia', label: 'Potencia (CV)' },
    { value: 'v.precio_original', label: 'Precio Original' },
    { value: 'v.precio_actual_estimado', label: 'Precio Estimado' },
    { value: 'v.peso', label: 'Peso (kg)' },
    { value: 'v.aceleracion_0_100', label: 'Aceleración (0-100)' },
    { value: 'v.velocidad_max', label: 'Velocidad Máx.' },
    { value: 'v.emisiones', label: 'Emisiones CO2' },
    { value: 'v.fecha_actualizacion', label: 'Actualizado Recientemente' },
    { value: 'v.fecha_creacion', label: 'Añadido Recientemente' },
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
            key={`search-${resetKey}`}
            type="text"
            id="searchText"
            name="searchText"
            placeholder="Marca, modelo, versión..."
            value={filters.searchText || ''}
            onChange={handleSearchTextChange}
            className="filter-input"
          />
        </div>

        {/* Filtro por Marca (Select) */}
        <div className="filter-group">
          <label htmlFor="marca">Marca</label>
          <select 
            key={`marca-${resetKey}`}
            id="marca" 
            name="marca" 
            value={selectedMarca} 
            onChange={handleMarcaChange} 
            className="filter-select"
          >
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
            <select 
              key={`modelo-${resetKey}`}
              id="modelo" 
              name="modelo" 
              value={selectedModelo} 
              onChange={handleModeloChange} 
              className="filter-select"
            >
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
            <select 
              key={`generacion-${resetKey}`}
              id="generacion" 
              name="generacion" 
              value={selectedGeneracion} 
              onChange={handleGeneracionChange} 
              className="filter-select"
            >
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
            <select 
              key={`motorizacion-${resetKey}`}
              id="motorizacion" 
              name="motorizacion" 
              value={selectedMotorizacion} 
              onChange={handleMotorizacionChange} 
              className="filter-select"
            >
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
            key={`combustible-${resetKey}`}
            id="combustible" 
            name="combustible" 
            value={filters.combustible || ''}
            onChange={handleCategoricalFilterChange} 
            className="filter-select"
          >
            <option value="">-- Todos --</option>
            {options?.combustibles?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Tipo de Vehículo */}
        <div className="filter-group">
          <label htmlFor="tipo">Tipo de Vehículo</label>
          <select 
            key={`tipo-${resetKey}`}
            id="tipo" 
            name="tipo" 
            value={filters.tipo || ''}
            onChange={handleCategoricalFilterChange} 
            className="filter-select"
          >
            <option value="">-- Todos --</option>
            {options?.tipos?.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Etiqueta DGT */}
        <div className="filter-group">
          <label htmlFor="pegatina_ambiental">Etiqueta DGT</label>
          <select 
            key={`pegatina-${resetKey}`}
            id="pegatina_ambiental" 
            name="pegatina_ambiental" 
            value={filters.pegatina_ambiental || ''}
            onChange={handleCategoricalFilterChange} 
            className="filter-select"
          >
            <option value="">-- Todas --</option>
            {options?.pegatinas?.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Tracción */}
        <div className="filter-group">
          <label htmlFor="traccion">Tracción</label>
          <select 
            key={`traccion-${resetKey}`}
            id="traccion" 
            name="traccion" 
            value={filters.traccion || ''}
            onChange={handleCategoricalFilterChange} 
            className="filter-select"
          >
            <option value="">-- Todas --</option>
            {options?.tracciones?.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Caja de Cambios */}
        <div className="filter-group">
          <label htmlFor="caja_cambios">Caja de Cambios</label>
          <select 
            key={`caja-${resetKey}`}
            id="caja_cambios" 
            name="caja_cambios" 
            value={filters.caja_cambios || ''}
            onChange={handleCategoricalFilterChange} 
            className="filter-select"
          >
            <option value="">-- Todas --</option>
            {options?.cajas_cambios?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Filtros de Rango (Año, Potencia, Precio, etc.) */}
        <div className="filter-group range-filter">
          <label>Año</label>
          <div className='range-inputs'>
            <input 
              type="number" 
              name="anioMin" 
              placeholder="Min" 
              value={filters.anioMin || ''} 
              onChange={handleRangeInputChange} 
              min="1886" 
              max={new Date().getFullYear()+2} 
              className="filter-input range"
            />
            <span>-</span>
            <input 
              type="number" 
              name="anioMax" 
              placeholder="Max" 
              value={filters.anioMax || ''} 
              onChange={handleRangeInputChange} 
              min="1886" 
              max={new Date().getFullYear()+2} 
              className="filter-input range"
            />
          </div>
        </div>
        
        <div className="filter-group range-filter">
          <label>Potencia (CV)</label>
          <div className='range-inputs'>
            <input 
              type="number" 
              name="potMin" 
              placeholder="Min" 
              value={filters.potMin || ''} 
              onChange={handleRangeInputChange} 
              min="0" 
              className="filter-input range"
            />
            <span>-</span>
            <input 
              type="number" 
              name="potMax" 
              placeholder="Max" 
              value={filters.potMax || ''} 
              onChange={handleRangeInputChange} 
              min="0" 
              className="filter-input range"
            />
          </div>
        </div>
        
        <div className="filter-group range-filter">
          <label>Precio Original (€)</label>
          <div className='range-inputs'>
            <input 
              type="number" 
              name="precioMin" 
              placeholder="Min" 
              value={filters.precioMin || ''} 
              onChange={handleRangeInputChange} 
              min="0" 
              step="100" 
              className="filter-input range"
            />
            <span>-</span>
            <input 
              type="number" 
              name="precioMax" 
              placeholder="Max" 
              value={filters.precioMax || ''} 
              onChange={handleRangeInputChange} 
              min="0" 
              step="100" 
              className="filter-input range"
            />
          </div>
        </div>

        <div className="filter-group range-filter">
          <label>Peso (kg)</label>
          <div className='range-inputs'>
            <input 
              type="number" 
              name="pesoMin" 
              placeholder="Min" 
              value={filters.pesoMin || ''} 
              onChange={handleRangeInputChange} 
              min="0" 
              step="10" 
              className="filter-input range"
            />
            <span>-</span>
            <input 
              type="number" 
              name="pesoMax" 
              placeholder="Max" 
              value={filters.pesoMax || ''} 
              onChange={handleRangeInputChange} 
              min="0" 
              step="10" 
              className="filter-input range"
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="filter-actions">
          <button type="submit" className="btn btn-primary btn-sm apply-filters-btn">
            <FaFilter /> Aplicar Rangos
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