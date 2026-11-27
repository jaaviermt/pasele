import { ESTADOS } from '../utils/estados'

// Filtros que se resuelven en el backend: GET /api/locations?search=&category=&zone=
// Abajo, contadores por estado de los puestos que quedaron.
export default function FiltersBar({ filters, onChange, onClear, categories, zones, locations }) {
  function handleChange(event) {
    onChange({ ...filters, [event.target.name]: event.target.value })
  }

  const hasFilters = filters.search || filters.category || filters.zone

  return (
    <section className="filtros" aria-label="Buscar y filtrar puestos">
      <div className="filtros__campos">
        <div className="campo">
          <label htmlFor="filtro-search">Buscar por nombre</label>
          <input id="filtro-search" name="search" type="search" value={filters.search}
            onChange={handleChange} placeholder="Ej. tacos" />
        </div>

        <div className="campo">
          <label htmlFor="filtro-category">Giro</label>
          <select id="filtro-category" name="category" value={filters.category} onChange={handleChange}>
            <option value="">Todos</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icono} {category.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="filtro-zone">Zona</label>
          <select id="filtro-zone" name="zone" value={filters.zone} onChange={handleChange}>
            <option value="">Todas</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>{zone.nombre}</option>
            ))}
          </select>
        </div>

        <button type="button" className="boton boton--secundario" onClick={onClear} disabled={!hasFilters}>
          Limpiar filtros
        </button>
      </div>

      <ul className="contadores" aria-label="Puestos por estado">
        <li><strong>{locations.length}</strong> Total</li>
        {Object.entries(ESTADOS).map(([clave, estado]) => (
          <li key={clave} className={`estado ${estado.clase}`}>
            <span aria-hidden="true">{estado.icono}</span>
            <strong>{locations.filter((location) => location.estado === clave).length}</strong> {estado.texto}
          </li>
        ))}
      </ul>
    </section>
  )
}
