import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useNotice } from '../context/NoticeContext'
import StallsMap from '../components/map/StallsMap'
import LocationsTable from '../components/LocationsTable'

// Vista principal: mapa + tabla. Ambos leen la misma lista "locations",
// así que al crear, editar o borrar se actualizan juntos sin recargar.
export default function MapPage() {
  const { showSuccess, showError } = useNotice()

  const [locations, setLocations] = useState([])
  const [categories, setCategories] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)

  // Carga inicial: puestos y catálogos para los selects
  useEffect(() => {
    Promise.all([apiFetch('/locations'), apiFetch('/categories'), apiFetch('/vendors')])
      .then(([locationsRes, categoriesRes, vendorsRes]) => {
        setLocations(locationsRes.data)
        setCategories(categoriesRes.data)
        setVendors(vendorsRes.data)
      })
      .catch(showError)
      .finally(() => setLoading(false))
  }, [showError])

  // Cada función actualiza la lista local con lo que respondió el backend.
  // Si falla, muestra el aviso y relanza el error para que el popup no se cierre.
  async function createLocation(body) {
    try {
      const response = await apiFetch('/locations', { method: 'POST', body })
      setLocations((current) => [response.data, ...current])
      showSuccess(response.message)
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

  return (
    <div className="vista-mapa">
      <p className="ayuda">Haz clic en el mapa para registrar un puesto. Haz clic en un toldo para verlo, editarlo o eliminarlo.</p>

      <StallsMap locations={locations} categories={categories} vendors={vendors}
        onCreate={createLocation} onUpdate={updateLocation} onDelete={deleteLocation} />

      <LocationsTable locations={locations} loading={loading} />
    </div>
  )
}
