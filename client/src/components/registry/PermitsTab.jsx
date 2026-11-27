import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import { useNotice } from '../../context/NoticeContext'
import useCrudList from '../../hooks/useCrudList'
import { Boton, Campo, EstadoVacio, InsigniaVigencia, Selector, Skeleton } from '../ui/ui'
import { IcoMas } from '../ui/icons'
import { DeleteModal, FormModal, RowActions } from './RegistryParts'
import { formatDate, formatMoney, toDateInput, todayInMexico } from '../../utils/format'

const EMPTY = { location: '', folio: '', vigenteHasta: '', cuota: '' }

// Mismas reglas que el backend
function validate(form) {
  const errors = {}
  if (!form.location) errors.location = 'Elige el puesto.'
  if (!form.folio.trim()) errors.folio = 'Escribe el folio.'
  else if (form.folio.trim().length > 30) errors.folio = 'Máximo 30 caracteres.'
  if (!form.vigenteHasta) errors.vigenteHasta = 'Elige la fecha de vigencia.'
  if (form.cuota === '' || Number.isNaN(Number(form.cuota)) || Number(form.cuota) < 0) {
    errors.cuota = 'Escribe una cuota de 0 o más.'
  }
  return errors
}

// Del permiso que llega del backend a los valores del formulario
function permitToForm(permit) {
  return {
    id: permit.id,
    location: permit.location?.id || '',
    folio: permit.folio,
    vigenteHasta: toDateInput(permit.vigenteHasta),
    cuota: String(permit.cuota),
  }
}

function PermitForm({ initial, locations, onClose, onSave }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function submit() {
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return false
    await onSave({
      location: form.location,
      folio: form.folio.trim(),
      vigenteHasta: form.vigenteHasta, // AAAA-MM-DD
      cuota: Number(form.cuota),
    })
  }

  return (
    <FormModal titulo={initial.id ? 'Editar permiso' : 'Agregar permiso'} onClose={onClose} onSubmit={submit}>
      <Selector label="Puesto" name="location" value={form.location} onChange={change} vacio="Elige un puesto"
        opciones={locations.map((location) => ({ valor: location.id, texto: location.nombre }))}
        error={errors.location}
        ayuda={locations.length === 0 ? 'No hay puestos. Regístralos primero en el mapa.' : undefined} />
      <Campo label="Folio" name="folio" value={form.folio} onChange={change} maxLength={30}
        placeholder="TNG-2026-0001" error={errors.folio} />
      <div className="p-fila">
        <Campo label="Vigente hasta" type="date" name="vigenteHasta" value={form.vigenteHasta} onChange={change}
          error={errors.vigenteHasta} />
        <Campo label="Cuota ($)" type="number" name="cuota" min={0} step="0.01" inputMode="decimal"
          value={form.cuota} onChange={change} error={errors.cuota} />
      </div>
    </FormModal>
  )
}

export default function PermitsTab() {
  const { showError } = useNotice()
  const { items, loading, create, update, remove } = useCrudList('/permits')
  const [locations, setLocations] = useState([])
  const [dialog, setDialog] = useState(null) // { tipo: 'form' | 'borrar', item }
  const close = () => setDialog(null)
  const today = todayInMexico()

  // Puestos para el select del formulario
  useEffect(() => {
    apiFetch('/locations')
      .then((response) => setLocations(response.data))
      .catch(showError)
  }, [showError])

  return (
    <>
      <div className="p-padron__barra">
        <Boton icono={<IcoMas size={16} />} onClick={() => setDialog({ tipo: 'form', item: EMPTY })}>Agregar permiso</Boton>
      </div>

      <div className="p-tabla-wrap" style={{ boxShadow: 'none' }}>
        <table className="p-tabla p-tabla--chica p-tabla--cards p-tabla--fija">
          <caption className="p-sr">Permisos</caption>
          <thead>
            <tr>
              <th scope="col">Puesto</th><th scope="col">Folio</th><th scope="col">Vigente hasta</th>
              <th scope="col">Cuota</th><th scope="col">Estado</th><th scope="col"><span className="p-sr">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6}><Skeleton /></td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={6}><EstadoVacio titulo="Aún no hay permisos" texto="Registra el permiso de cada puesto." /></td></tr>
            )}
            {!loading && items.map((permit) => (
              <tr key={permit.id}>
                <td data-col="Puesto"><b>{permit.location?.nombre || '—'}</b></td>
                <td data-col="Folio" className="p-num">{permit.folio}</td>
                <td data-col="Vigente hasta" className="p-num">{formatDate(permit.vigenteHasta)}</td>
                <td data-col="Cuota" className="p-num">{formatMoney(permit.cuota)}</td>
                {/* Vigente si vence hoy o después (misma regla que el estado del puesto) */}
                <td data-col="Estado"><InsigniaVigencia vigente={toDateInput(permit.vigenteHasta) >= today} /></td>
                <td data-col="Acciones">
                  <RowActions nombre={permit.folio} onEdit={() => setDialog({ tipo: 'form', item: permitToForm(permit) })}
                    onDelete={() => setDialog({ tipo: 'borrar', item: permit })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dialog?.tipo === 'form' && (
        <PermitForm initial={dialog.item} locations={locations} onClose={close}
          onSave={(body) => (dialog.item.id ? update(dialog.item.id, body) : create(body))} />
      )}
      {dialog?.tipo === 'borrar' && (
        <DeleteModal nombre={`el permiso ${dialog.item.folio}`} aviso="" onClose={close}
          onConfirm={() => remove(dialog.item.id)} />
      )}
    </>
  )
}
