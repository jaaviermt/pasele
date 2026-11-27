import { useState } from 'react'
import LocationFields from './LocationFields'
import StatusBadge from '../StatusBadge'
import { formToBody, locationToForm, validateLocationForm } from '../../utils/locationForm'
import { formatCoordinate } from '../../utils/format'

// Contenido del popup de un puesto. Tiene 3 modos:
//   ver     -> datos del puesto con botones Editar y Eliminar
//   editar  -> formulario dentro del mismo popup
//   borrar  -> confirmación dentro del popup (sin window.confirm)
export default function LocationPopup({ location, categories, vendors, onUpdate, onDelete }) {
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

  if (mode === 'editar') {
    return (
      <form className="formulario formulario--popup" onSubmit={handleSave} noValidate>
        <h3 className="popup__titulo">Editar puesto</h3>
        <LocationFields form={form} errors={errors} onChange={handleChange}
          categories={categories} vendors={vendors} idPrefix={`editar-${location.id}`} />
        <div className="popup__acciones">
          <button type="submit" className="boton boton--primario" disabled={sending}>
            {sending ? 'Guardando…' : 'Guardar'}
          </button>
          <button type="button" className="boton boton--secundario" onClick={() => setMode('ver')}>
            Cancelar
          </button>
        </div>
      </form>
    )
  }

  if (mode === 'borrar') {
    return (
      <div className="popup__confirmar" role="alertdialog" aria-labelledby={`borrar-${location.id}`}>
        <p id={`borrar-${location.id}`}>
          <strong>¿Eliminar «{location.nombre}»?</strong> También se borrarán sus permisos.
          Esta acción no se puede deshacer.
        </p>
        <div className="popup__acciones">
          <button type="button" className="boton boton--peligro" onClick={handleDelete} disabled={sending}>
            {sending ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
          <button type="button" className="boton boton--secundario" onClick={() => setMode('ver')}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="popup__ver">
      <h3 className="popup__titulo">{location.nombre}</h3>
      <StatusBadge estado={location.estado} />
      <dl className="popup__datos">
        <dt>Giro</dt>
        <dd>{location.category ? `${location.category.icono} ${location.category.nombre}` : '—'}</dd>
        <dt>Comerciante</dt>
        <dd>{location.vendor ? location.vendor.nombre : 'Sin comerciante'}</dd>
        <dt>Descripción</dt>
        <dd>{location.descripcion}</dd>
        <dt>Coordenadas</dt>
        <dd>{formatCoordinate(lat)}, {formatCoordinate(lng)}</dd>
      </dl>
      <div className="popup__acciones">
        <button type="button" className="boton boton--primario" onClick={startEditing}>
          Editar
        </button>
        <button type="button" className="boton boton--peligro" onClick={() => setMode('borrar')}>
          Eliminar
        </button>
      </div>
    </div>
  )
}
