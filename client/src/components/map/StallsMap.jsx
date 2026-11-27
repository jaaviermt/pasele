import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import LocationPopup from './LocationPopup'
import NewLocationForm from './NewLocationForm'
import { createMarkerIcon, newPointIcon } from './markerIcon'

// Centro inicial: León, Guanajuato. Leaflet usa [latitud, longitud].
const INITIAL_CENTER = [21.1236, -101.682]
const INITIAL_ZOOM = 15

// Escucha los clics en el mapa y avisa el punto elegido
function ClickToAdd({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng)
    },
  })
  return null
}

// Marcador temporal con el formulario de alta; abre su popup en cuanto aparece.
// No se quita al cerrar el popup (React en modo estricto lo cierra y reabre al montar);
// se quita con "Cancelar", al guardar o al hacer clic en otro punto del mapa.
function NewPointMarker({ point, categories, vendors, onCreate, onClose }) {
  const markerRef = useRef(null)

  useEffect(() => {
    markerRef.current?.openPopup()
  }, [point])

  return (
    <Marker position={point} icon={newPointIcon} ref={markerRef} title="Nuevo puesto (clic para abrir)">
      <Popup minWidth={260} maxWidth={320}>
        {/* key: si se hace clic en otro punto, el formulario empieza vacío */}
        <NewLocationForm key={`${point.lat},${point.lng}`} point={point} categories={categories}
          vendors={vendors} onCreate={onCreate} onCancel={onClose} />
      </Popup>
    </Marker>
  )
}

// Marcador de un puesto guardado
function LocationMarker({ location, categories, vendors, onUpdate, onDelete }) {
  // Cambia cada vez que se cierra el popup para que al reabrirlo empiece en modo "ver"
  const [popupVersion, setPopupVersion] = useState(0)
  const markerRef = useRef(null)
  const [lng, lat] = location.ubicacion.coordinates // GeoJSON -> Leaflet

  // react-leaflet solo pone el "title" al crear el marcador; al editar el nombre se actualiza aquí
  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return
    marker.options.title = location.nombre
    marker.getElement()?.setAttribute('title', location.nombre)
  }, [location.nombre])

  return (
    <Marker position={[lat, lng]} icon={createMarkerIcon(location.category?.color, location.estado)}
      title={location.nombre} ref={markerRef}>
      <Popup minWidth={260} maxWidth={320}
        eventHandlers={{ remove: () => setPopupVersion((version) => version + 1) }}>
        <LocationPopup key={popupVersion} location={location} categories={categories}
          vendors={vendors} onUpdate={onUpdate} onDelete={onDelete} />
      </Popup>
    </Marker>
  )
}

export default function StallsMap({ locations, categories, vendors, onCreate, onUpdate, onDelete }) {
  const [newPoint, setNewPoint] = useState(null)

  async function handleCreate(body) {
    await onCreate(body)
    setNewPoint(null) // al guardarse, el marcador temporal se quita
  }

  return (
    <MapContainer center={INITIAL_CENTER} zoom={INITIAL_ZOOM} className="mapa">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <ClickToAdd onPick={setNewPoint} />

      {locations.map((location) => (
        <LocationMarker key={location.id} location={location} categories={categories}
          vendors={vendors} onUpdate={onUpdate} onDelete={onDelete} />
      ))}

      {newPoint && (
        <NewPointMarker point={newPoint} categories={categories} vendors={vendors}
          onCreate={handleCreate} onClose={() => setNewPoint(null)} />
      )}
    </MapContainer>
  )
}
