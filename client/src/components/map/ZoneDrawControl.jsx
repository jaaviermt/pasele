import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

// Agrega al mapa la barra de Leaflet-Geoman solo con las herramientas
// para dibujar zonas (polígono y rectángulo). Al terminar un trazo, avisa con onDrawn(layer).
export default function ZoneDrawControl({ onDrawn }) {
  const map = useMap()

  // Se guarda la función más reciente sin volver a montar la barra en cada render
  const onDrawnRef = useRef(onDrawn)
  useEffect(() => {
    onDrawnRef.current = onDrawn
  }, [onDrawn])

  useEffect(() => {
    map.pm.setLang('es')
    // Geoman no deja cerrar un polígono cuyos lados se crucen
    map.pm.setGlobalOptions({ allowSelfIntersection: false })

    map.pm.addControls({
      position: 'topleft',
      drawPolygon: true,
      drawRectangle: true,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawCircle: false,
      drawText: false,
      editMode: false,
      dragMode: false,
      cutPolygon: false,
      removalMode: false,
      rotateMode: false,
    })

    const handleCreate = (event) => onDrawnRef.current(event.layer)
    map.on('pm:create', handleCreate)

    return () => {
      map.off('pm:create', handleCreate)
      map.pm.removeControls()
    }
  }, [map])

  return null
}
