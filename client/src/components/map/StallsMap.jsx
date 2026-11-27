import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Polygon, Popup, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import LocationPopup from './LocationPopup'
import NewLocationForm from './NewLocationForm'
import ZoneDrawControl from './ZoneDrawControl'
import { createMarkerIcon, newPointIcon } from './markerIcon'

const ZONE_STYLE = { color: '#2b45c9', weight: 3, dashArray: '8 6', fillColor: '#4c8fd6', fillOpacity: 0.15 }

// Centro inicial: León, Guanajuato. Leaflet usa [latitud, longitud].
const INITIAL_CENTER = [21.1236, -101.682]
const INITIAL_ZOOM = 15

// Escucha los clics en el mapa y avisa el punto elegido.
// Mientras se dibuja una zona, los clics son vértices del polígono y se ignoran aquí.
function ClickToAdd({ onPick }) {
  const map = useMapEvents({
    click(event) {
      if (map.pm?.globalDrawModeEnabled()) return
      onPick(event.latlng)
    },
  })
  return null
}

// Zona guardada. interactive={false}: los clics la atraviesan y llegan al mapa,
// así se pueden registrar puestos dentro del tianguis.
function ZoneShape({ zone }) {
  const positions = zone.area.coordinates[0].map(([lng, lat]) => [lat, lng]) // GeoJSON -> Leaflet

  return (
    <Polygon positions={positions} pathOptions={ZONE_STYLE} interactive={false} pmIgnore>
      <Tooltip permanent direction="center" className="etiqueta-zona">{zone.nombre}</Tooltip>
    </Polygon>
  )
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

export default function StallsMap({
  locations, zones, categories, vendors, onCreate, onUpdate, onDelete, onZoneDrawn,
}) {
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
      <ZoneDrawControl onDrawn={onZoneDrawn} />

      {/* Zonas primero para que los toldos queden encima */}
      {zones.map((zone) => (
        <ZoneShape key={zone.id} zone={zone} />
      ))}

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
