import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useNotice } from '../context/NoticeContext'
import StallsMap from '../components/map/StallsMap'
import ZoneDialog from '../components/map/ZoneDialog'
import ZonesPanel from '../components/map/ZonesPanel'
import { Counters, FiltersBar } from '../components/FiltersBar'
import LocationsTable from '../components/LocationsTable'

const EMPTY_FILTERS = { search: '', category: '', zone: '' }
const SEARCH_DELAY_MS = 300 // espera a que el usuario deje de escribir

// Arma "?search=...&category=..." solo con los filtros que tienen valor
function toQuery(filters) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value.trim()) params.set(key, value.trim())
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

// Vista principal: filtros, mapa con zonas y tabla. El mapa y la tabla leen
// la misma lista "locations", así que siempre muestran lo mismo.
export default function MapPage() {
  const { showSuccess, showError } = useNotice()

  const [locations, setLocations] = useState([])
  const [zones, setZones] = useState([])
  const [categories, setCategories] = useState([])
  const [vendors, setVendors] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  // Al cambiar, vuelve a pedir los puestos (ej. el estado cambia al crear o borrar una zona)
  const [reloadKey, setReloadKey] = useState(0)
  // Trazo recién dibujado que espera nombre: { layer, area }
  const [pendingZone, setPendingZone] = useState(null)

  const refreshLocations = () => setReloadKey((key) => key + 1)

  // Catálogos y zonas: una sola vez al abrir
  useEffect(() => {
    Promise.all([apiFetch('/categories'), apiFetch('/vendors'), apiFetch('/zones')])
      .then(([categoriesRes, vendorsRes, zonesRes]) => {
        setCategories(categoriesRes.data)
        setVendors(vendorsRes.data)
        setZones(zonesRes.data)
      })
      .catch(showError)
  }, [showError])

  // Puestos: cada vez que cambian los filtros. El filtrado lo hace el backend.
  useEffect(() => {
    let cancelled = false // evita que una respuesta vieja pise a una nueva

    const timer = setTimeout(() => {
      apiFetch(`/locations${toQuery(filters)}`)
        .then((response) => {
          if (!cancelled) setLocations(response.data)
        })
        .catch((error) => {
          if (!cancelled) showError(error)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, SEARCH_DELAY_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [filters, reloadKey, showError])

  // ---------- Puestos ----------
  // Se actualiza la lista local al instante y luego se vuelve a pedir con los
  // filtros activos (un puesto editado puede dejar de cumplirlos).
  async function createLocation(body) {
    try {
      const response = await apiFetch('/locations', { method: 'POST', body })
      setLocations((current) => [response.data, ...current])
      showSuccess(response.message)
      refreshLocations()
    } catch (error) {
      showError(error)
      throw error
    }
  }

  async function updateLocation(id, body) {
    try {
      const response = await apiFetch(`/locations/${id}`, { method: 'PATCH', body })
      setLocations((current) => current.map((item) => (item.id === id ? response.data : item)))
      showSuccess(response.message)
      refreshLocations()
    } catch (error) {
      showError(error)
      throw error
    }
  }

  async function deleteLocation(id) {
    try {
      const response = await apiFetch(`/locations/${id}`, { method: 'DELETE' })
      setLocations((current) => current.filter((item) => item.id !== id))
      const extra = response.data.permisosEliminados
        ? ` Se borraron ${response.data.permisosEliminados} permiso(s).`
        : ''
      showSuccess(response.message + extra)
    } catch (error) {
      showError(error)
      throw error
    }
  }

  // ---------- Zonas ----------
  function handleZoneDrawn(layer) {
    // toGeoJSON() ya devuelve [longitud, latitud] y el anillo cerrado
    setPendingZone({ layer, area: layer.toGeoJSON().geometry })
  }

  function discardPendingZone() {
    pendingZone?.layer.remove() // quita el trazo temporal de Geoman
    setPendingZone(null)
  }

  async function saveZone({ nombre, dias }) {
    try {
      const response = await apiFetch('/zones', {
        method: 'POST',
        body: { nombre, dias, area: pendingZone.area },
      })
      pendingZone.layer.remove() // ahora la dibuja React a partir de "zones"
      setPendingZone(null)
      setZones((current) => [...current, response.data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      showSuccess(response.message)
      refreshLocations() // el estado de los puestos puede cambiar
    } catch (error) {
      showError(error)
      throw error // el diálogo se queda abierto
    }
  }

  async function deleteZone(id) {
    try {
      const response = await apiFetch(`/zones/${id}`, { method: 'DELETE' })
      setZones((current) => current.filter((zone) => zone.id !== id))
      showSuccess(response.message)
      // Si se estaba filtrando por esa zona, se quita el filtro (eso ya recarga los puestos)
      if (filters.zone === id) setFilters((current) => ({ ...current, zone: '' }))
      else refreshLocations()
    } catch (error) {
      showError(error)
      throw error
    }
  }

  return (
    <main className="p-page">
      <div className="p-page__titulo">
        <h1 className="p-h1">El Mapa</h1>
        <span className="p-script">del tianguis de hoy</span>
      </div>

      <FiltersBar filters={filters} onChange={setFilters} onClear={() => setFilters(EMPTY_FILTERS)}
        categories={categories} zones={zones} />
      <Counters locations={locations} />

      <p className="p-ayuda-mapa">
        Haz clic en el mapa para registrar un puesto. Haz clic en un toldo para verlo, editarlo o eliminarlo.
      </p>

      <div className="p-mapa-layout">
        <StallsMap locations={locations} zones={zones} categories={categories} vendors={vendors}
          onCreate={createLocation} onUpdate={updateLocation} onDelete={deleteLocation}
          onZoneDrawn={handleZoneDrawn} />
        <ZonesPanel zones={zones} onDelete={deleteZone} />
      </div>

      <h2 className="p-h2" style={{ marginBottom: 16 }}>Puestos ({locations.length})</h2>
      <LocationsTable locations={locations} loading={loading} />

      {pendingZone && <ZoneDialog onSave={saveZone} onDiscard={discardPendingZone} />}
    </main>
  )
}
