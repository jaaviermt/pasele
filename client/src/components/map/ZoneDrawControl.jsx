import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

// Conecta Leaflet-Geoman con el botón "Dibujar zona" del diseño (no usa la barra de Geoman).
//   drawing=true  -> activa el trazo de polígono
//   drawing=false -> lo cancela
// Avisa con onDrawn(layer) al cerrar el polígono y con onDrawEnd() cuando el trazo termina
// (guardado o cancelado), para que el botón vuelva a su estado normal.
export default function ZoneDrawControl({ drawing, onDrawn, onDrawEnd }) {
  const map = useMap()

  // Se guardan las funciones más recientes sin volver a registrar los eventos
  const callbacks = useRef({ onDrawn, onDrawEnd })
  useEffect(() => {
    callbacks.current = { onDrawn, onDrawEnd }
  }, [onDrawn, onDrawEnd])

  useEffect(() => {
    map.pm.setLang('es')
    const handleCreate = (event) => callbacks.current.onDrawn(event.layer)
    const handleDrawEnd = () => callbacks.current.onDrawEnd()
    map.on('pm:create', handleCreate)
    map.on('pm:drawend', handleDrawEnd)
    return () => {
      map.off('pm:create', handleCreate)
      map.off('pm:drawend', handleDrawEnd)
    }
  }, [map])

  useEffect(() => {
    if (drawing) {
      // allowSelfIntersection: false -> Geoman no deja poner un vértice que cruce otro lado
      map.pm.enableDraw('Polygon', { allowSelfIntersection: false })
    } else if (map.pm.globalDrawModeEnabled()) {
      map.pm.disableDraw()
    }
  }, [drawing, map])

  return null
}
