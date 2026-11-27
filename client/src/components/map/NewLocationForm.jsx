import { useState } from 'react'
import LocationFields from './LocationFields'
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
    <form className="formulario formulario--popup" onSubmit={handleSubmit} noValidate>
      <h3 className="popup__titulo">Nuevo puesto</h3>

      <LocationFields form={form} errors={errors} onChange={handleChange}
        categories={categories} vendors={vendors} idPrefix="nuevo" />

      <p className="popup__coordenadas">
        Lat {formatCoordinate(point.lat)}, Lng {formatCoordinate(point.lng)}
      </p>

      <div className="popup__acciones">
        <button type="submit" className="boton boton--primario" disabled={sending}>
          {sending ? 'Guardando…' : 'Registrar puesto'}
        </button>
        <button type="button" className="boton boton--secundario" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
