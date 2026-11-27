import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Polygon, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import AutoSizePopup from './AutoSizePopup'
import LocationPopup from './LocationPopup'
import NewLocationForm from './NewLocationForm'
import ZoneDrawControl from './ZoneDrawControl'
import { createMarkerIcon, newPointIcon } from './markerIcon'
import { Boton, InsigniaEstado } from '../ui/ui'
import { IcoLapizZona, IcoX } from '../ui/icons'
import { ESTADOS } from '../../utils/estados'
import { zoneColor } from '../../utils/zonas'

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
  const color = zoneColor(zone.id)

  return (
    <Polygon positions={positions} interactive={false} pmIgnore
      pathOptions={{ color, weight: 3, dashArray: '8 6', fillColor: color, fillOpacity: 0.18 }}>
      <Tooltip permanent direction="center" className="p-etiqueta-zona">{zone.nombre}</Tooltip>
    </Polygon>
  )
}

// Marcador temporal con el formulario de alta; abre su popup en cuanto aparece.
// No se quita al cerrar el popup (React en modo estricto lo cierra y reabre al montar);
// se quita con la "x", al guardar o al hacer clic en otro punto del mapa.
function NewPointMarker({ point, categories, vendors, onCreate, onClose }) {
  const markerRef = useRef(null)

  useEffect(() => {
    markerRef.current?.openPopup()
  }, [point])

  return (
    <Marker position={point} icon={newPointIcon} ref={markerRef} title="Nuevo puesto (clic para abrir)">
      <AutoSizePopup>
        {/* key: si se hace clic en otro punto, el formulario empieza vacío */}
        <NewLocationForm key={`${point.lat},${point.lng}`} point={point} categories={categories}
          vendors={vendors} onCreate={onCreate} onCancel={onClose} />
      </AutoSizePopup>
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
    <Marker position={[lat, lng]} icon={createMarkerIcon(location.category, location.estado)}
      title={location.nombre} ref={markerRef}>
      <AutoSizePopup eventHandlers={{ remove: () => setPopupVersion((version) => version + 1) }}>
        <LocationPopup key={popupVersion} location={location} categories={categories}
          vendors={vendors} onUpdate={onUpdate} onDelete={onDelete} />
      </AutoSizePopup>
    </Marker>
  )
}

function Leyenda() {
  return (
    <div className="p-leyenda">
      <h3>Estados</h3>
      {Object.keys(ESTADOS).map((clave) => <InsigniaEstado key={clave} estado={clave} />)}
    </div>
  )
}

export default function StallsMap({
  locations, zones, categories, vendors, onCreate, onUpdate, onDelete, onZoneDrawn,
}) {
  const [newPoint, setNewPoint] = useState(null)
  const [drawing, setDrawing] = useState(false)

  async function handleCreate(body) {
    await onCreate(body)
    setNewPoint(null) // al guardarse, el marcador temporal se quita
  }

  function toggleDrawing() {
    setNewPoint(null)
    setDrawing((current) => !current)
  }

  return (
    // El botón y la leyenda van encima del mapa, fuera de Leaflet, para que sus clics no lleguen al mapa
    <div className="p-mapa">
      <MapContainer center={INITIAL_CENTER} zoom={INITIAL_ZOOM} className="p-mapa__leaflet">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <ClickToAdd onPick={setNewPoint} />
        <ZoneDrawControl drawing={drawing} onDrawn={onZoneDrawn} onDrawEnd={() => setDrawing(false)} />

        {/* Zonas primero para que los toldos queden encima */}
        {zones.map((zone) => <ZoneShape key={zone.id} zone={zone} />)}

        {locations.map((location) => (
          <LocationMarker key={location.id} location={location} categories={categories}
            vendors={vendors} onUpdate={onUpdate} onDelete={onDelete} />
        ))}

        {newPoint && (
          <NewPointMarker point={newPoint} categories={categories} vendors={vendors}
            onCreate={handleCreate} onClose={() => setNewPoint(null)} />
        )}
      </MapContainer>

      <div className="p-mapa__herr">
        <Boton chico variante={drawing ? 'primario' : 'azul'} aria-pressed={drawing} onClick={toggleDrawing}
          icono={drawing ? <IcoX size={16} /> : <IcoLapizZona size={16} />}>
          {drawing ? 'Cancelar trazo' : 'Dibujar zona'}
        </Boton>
        {drawing && (
          <span className="p-mapa__instruccion" role="status">
            Haz clic para poner vértices y en el primero para cerrar la zona
          </span>
        )}
      </div>

      <Leyenda />
    </div>
  )
}
