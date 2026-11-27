import { Boton, Campo, IconoEstado, Selector } from './ui/ui'
import { IcoX, Toldo } from './ui/icons'
import { ESTADOS } from '../utils/estados'

// Filtros que se resuelven en el backend: GET /api/locations?search=&category=&zone=
export function FiltersBar({ filters, onChange, onClear, categories, zones }) {
  function handleChange(event) {
    onChange({ ...filters, [event.target.name]: event.target.value })
  }

  const hasFilters = Boolean(filters.search || filters.category || filters.zone)

  return (
    <form className="p-card p-filtros" role="search" onSubmit={(event) => event.preventDefault()}>
      <Campo label="Buscar por nombre" type="search" name="search" placeholder="Ej. Tacos"
        value={filters.search} onChange={handleChange} />
      <Selector label="Giro" name="category" vacio="Todos" value={filters.category} onChange={handleChange}
        opciones={categories.map((category) => ({ valor: category.id, texto: `${category.icono} ${category.nombre}` }))} />
      <Selector label="Zona" name="zone" vacio="Todas" value={filters.zone} onChange={handleChange}
        opciones={zones.map((zone) => ({ valor: zone.id, texto: zone.nombre }))} />
      <Boton variante="fantasma" icono={<IcoX size={16} />} onClick={onClear} disabled={!hasFilters}>
        Limpiar filtros
      </Boton>
    </form>
  )
}

// Contadores por estado de los puestos que devolvió el filtro
export function Counters({ locations }) {
  const count = (clave) => locations.filter((location) => location.estado === clave).length

  return (
    <div className="p-contadores" role="group" aria-label="Puestos por estado">
      <div className="p-contador p-contador--total">
        <Toldo size={30} color="#f6b80f" />
        <div><div className="p-contador__n">{locations.length}</div><div className="p-contador__t">Total</div></div>
      </div>
      {Object.entries(ESTADOS).map(([clave, estado]) => (
        <div key={clave} className={`p-contador p-contador--${estado.clase}`}>
          <IconoEstado estado={clave} size={26} />
          <div><div className="p-contador__n">{count(clave)}</div><div className="p-contador__t">{estado.texto}</div></div>
        </div>
      ))}
    </div>
  )
}
