import { useCallback, useRef } from 'react'
import { Popup } from 'react-leaflet'

// Popup del diseño que se reacomoda solo.
// Leaflet calcula tamaño y posición del popup solo al abrirlo; si después el contenido
// crece (pasar a "Editar", aparecen errores), se saldría del mapa. Un ResizeObserver
// vigila el contenido y llama a popup.update(), que recalcula y mueve el mapa si hace falta.
const POPUP_OPTIONS = {
  className: 'p-leaflet-popup', // quita el globo blanco por defecto (ver index.css)
  closeButton: false, // el diseño trae su propio botón de cerrar
  minWidth: 280,
  maxWidth: 340,
  maxHeight: 460, // si no cabe, se desplaza por dentro
  closeOnClick: false, // los clics de los botones no deben cerrar el popup
}

export default function AutoSizePopup({ children, eventHandlers }) {
  const popupRef = useRef(null)
  const observerRef = useRef(null)

  // react-leaflet solo pinta el contenido mientras el popup está abierto, por eso se usa
  // una "callback ref": corre cada vez que el contenido aparece (nodo) o desaparece (null).
  const contentRef = useCallback((node) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!node) return

    observerRef.current = new ResizeObserver(() => {
      if (popupRef.current?.isOpen()) popupRef.current.update()
    })
    observerRef.current.observe(node)
  }, [])

  return (
    <Popup ref={popupRef} {...POPUP_OPTIONS} eventHandlers={eventHandlers}>
      <div ref={contentRef}>{children}</div>
    </Popup>
  )
}
