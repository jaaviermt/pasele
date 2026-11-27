import { useState } from 'react'
import LocationFields from './LocationFields'
import { Boton, Campo } from '../ui/ui'
import { IcoX } from '../ui/icons'
import { EMPTY_LOCATION_FORM, formToBody, validateLocationForm } from '../../utils/locationForm'
import { formatCoordinate } from '../../utils/format'

// Formulario de alta que aparece en el popup del punto donde se hizo clic.
export default function NewLocationForm({ point, categories, vendors, onCreate, onCancel }) {
  const [form, setForm] = useState(EMPTY_LOCATION_FORM)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const found = validateLocationForm(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSending(true)
    try {
      await onCreate({
        ...formToBody(form),
        // GeoJSON: [longitud, latitud]
        ubicacion: { type: 'Point', coordinates: [point.lng, point.lat] },
      })
    } catch {
      // El aviso de error ya lo mostró MapPage; el formulario se queda abierto
      setSending(false)
    }
  }

  return (
    <div className="p-popup" role="dialog" aria-label="Nuevo puesto" style={{ '--p-color': 'var(--p-verde-vivo)' }}>
      <div className="p-popup__toldo" />
      <button type="button" className="p-icon-btn p-popup__cerrar" onClick={onCancel} aria-label="Cerrar">
        <IcoX size={14} />
      </button>
      <form className="p-popup__body" onSubmit={handleSubmit} noValidate>
        <h3 className="p-popup__titulo">¡Nuevo puesto!</h3>
        <LocationFields form={form} errors={errors} onChange={handleChange}
          categories={categories} vendors={vendors} />
        <Campo label="Coordenadas" readOnly
          value={`${formatCoordinate(point.lat)}, ${formatCoordinate(point.lng)}`} />
        <Boton type="submit" cargando={sending} textoCargando="Guardando…" style={{ width: '100%' }}>
          Registrar puesto
        </Boton>
      </form>
    </div>
  )
}
