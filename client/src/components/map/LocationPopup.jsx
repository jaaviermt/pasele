import { useState } from 'react'
import { useMap } from 'react-leaflet'
import LocationFields from './LocationFields'
import { Boton, ChipGiro, InsigniaEstado } from '../ui/ui'
import { IcoBote, IcoLapiz, IcoX } from '../ui/icons'
import { formToBody, locationToForm, validateLocationForm } from '../../utils/locationForm'
import { formatCoordinate } from '../../utils/format'

// Contenido del popup de un puesto. Tiene 3 modos:
//   ver     -> datos del puesto con botones Editar y Eliminar
//   editar  -> formulario dentro del mismo popup
//   borrar  -> confirmación dentro del popup (sin window.confirm)
export default function LocationPopup({ location, categories, vendors, onUpdate, onDelete }) {
  const map = useMap()
  const [mode, setMode] = useState('ver')
  const [form, setForm] = useState(() => locationToForm(location))
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)

  const [lng, lat] = location.ubicacion.coordinates

  function startEditing() {
    setForm(locationToForm(location)) // siempre parte de los datos actuales
    setErrors({})
    setMode('editar')
  }

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    const found = validateLocationForm(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSending(true)
    try {
      await onUpdate(location.id, formToBody(form))
      setMode('ver')
    } catch {
      // El aviso de error ya se mostró; se queda en modo edición
    } finally {
      setSending(false)
    }
  }

  async function handleDelete() {
    setSending(true)
    try {
      await onDelete(location.id) // al borrarse, el marcador y su popup desaparecen
    } catch {
      setSending(false)
    }
  }

  return (
    <div className="p-popup" role="dialog" aria-label={`Puesto ${location.nombre}`}
      style={{ '--p-color': location.category?.color }}>
      <div className="p-popup__toldo" />
      <button type="button" className="p-icon-btn p-popup__cerrar" onClick={() => map.closePopup()} aria-label="Cerrar">
        <IcoX size={14} />
      </button>

      <div className="p-popup__body">
        {mode === 'ver' && (
          <>
            <h3 className="p-popup__titulo">{location.nombre}</h3>
            <div className="p-popup__insignias">
              <ChipGiro giro={location.category} />
              <InsigniaEstado estado={location.estado} />
            </div>
            <dl>
              <dt>Comerciante</dt>
              <dd>{location.vendor ? location.vendor.nombre : 'Sin asignar'}</dd>
              <dt>Descripción</dt>
              <dd>{location.descripcion}</dd>
              <dt>Coordenadas</dt>
              <dd className="p-num">{formatCoordinate(lat)}, {formatCoordinate(lng)}</dd>
            </dl>
            <div className="p-acciones">
              <Boton chico variante="secundario" icono={<IcoLapiz size={16} />} onClick={startEditing}>Editar</Boton>
              <Boton chico variante="peligro" icono={<IcoBote size={16} />} onClick={() => setMode('borrar')}>Eliminar</Boton>
            </div>
          </>
        )}

        {mode === 'editar' && (
          <form onSubmit={handleSave} noValidate>
            <h3 className="p-popup__titulo">Editar puesto</h3>
            <LocationFields form={form} errors={errors} onChange={handleChange}
              categories={categories} vendors={vendors} />
            <div className="p-acciones">
              <Boton type="submit" chico cargando={sending} textoCargando="Guardando…">Guardar</Boton>
              <Boton chico variante="fantasma" onClick={() => setMode('ver')}>Cancelar</Boton>
            </div>
          </form>
        )}

        {mode === 'borrar' && (
          <>
            <h3 className="p-popup__titulo">{location.nombre}</h3>
            <p className="p-popup__peligro" role="alert">
              <IcoBote size={20} />
              ¿Eliminar este puesto? También se borran sus permisos. No se puede deshacer.
            </p>
            <div className="p-acciones">
              <Boton chico variante="primario" cargando={sending} textoCargando="Eliminando…" onClick={handleDelete}>
                Sí, eliminar
              </Boton>
              <Boton chico variante="fantasma" onClick={() => setMode('ver')}>Cancelar</Boton>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
