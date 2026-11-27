import { useState } from 'react'
import useCrudList from '../../hooks/useCrudList'
import { Boton, Campo, EstadoVacio, Skeleton } from '../ui/ui'
import { IcoMas } from '../ui/icons'
import { DeleteModal, FormModal, RowActions } from './RegistryParts'
import { formatPhone } from '../../utils/format'

const EMPTY = { nombre: '', apodo: '', telefono: '' }

// Mismas reglas que el backend
function validate(form) {
  const errors = {}
  if (!form.nombre.trim()) errors.nombre = 'Escribe el nombre del comerciante.'
  else if (form.nombre.trim().length > 80) errors.nombre = 'Máximo 80 caracteres.'
  if (form.apodo.trim().length > 40) errors.apodo = 'Máximo 40 caracteres.'
  if (form.telefono.trim() && !/^\d{10}$/.test(form.telefono.trim())) {
    errors.telefono = 'El teléfono debe tener 10 dígitos, sin espacios ni guiones.'
  }
  return errors
}

function VendorForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function submit() {
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return false
    await onSave({ nombre: form.nombre.trim(), apodo: form.apodo.trim(), telefono: form.telefono.trim() })
  }

  return (
    <FormModal titulo={initial.id ? 'Editar comerciante' : 'Agregar comerciante'} onClose={onClose} onSubmit={submit}>
      <Campo label="Nombre" name="nombre" value={form.nombre} onChange={change} maxLength={80}
        autoComplete="off" error={errors.nombre} />
      <Campo label="Apodo (opcional)" name="apodo" value={form.apodo} onChange={change} maxLength={40}
        placeholder="Ej. Don Pepe" error={errors.apodo} />
      <Campo label="Teléfono (opcional)" name="telefono" type="tel" inputMode="numeric" value={form.telefono}
        onChange={change} maxLength={10} ayuda="10 dígitos" error={errors.telefono} />
    </FormModal>
  )
}

export default function VendorsTab() {
  const { items, loading, create, update, remove } = useCrudList('/vendors')
  const [dialog, setDialog] = useState(null) // { tipo: 'form' | 'borrar', item }
  const close = () => setDialog(null)

  return (
    <>
      <div className="p-padron__barra">
        <Boton icono={<IcoMas size={16} />} onClick={() => setDialog({ tipo: 'form', item: EMPTY })}>Agregar comerciante</Boton>
      </div>

      <div className="p-tabla-wrap" style={{ boxShadow: 'none' }}>
        <table className="p-tabla p-tabla--chica p-tabla--cards p-tabla--fija">
          <caption className="p-sr">Comerciantes</caption>
          <thead>
            <tr><th scope="col">Nombre</th><th scope="col">Apodo</th><th scope="col">Teléfono</th><th scope="col"><span className="p-sr">Acciones</span></th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4}><Skeleton /></td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={4}><EstadoVacio titulo="Aún no hay comerciantes" texto="Agrega a quienes atienden los puestos." /></td></tr>
            )}
            {!loading && items.map((vendor) => (
              <tr key={vendor.id}>
                <td data-col="Nombre"><b>{vendor.nombre}</b></td>
                <td data-col="Apodo">{vendor.apodo || '—'}</td>
                <td data-col="Teléfono" className="p-num">{formatPhone(vendor.telefono)}</td>
                <td data-col="Acciones">
                  <RowActions nombre={vendor.nombre} onEdit={() => setDialog({ tipo: 'form', item: vendor })}
                    onDelete={() => setDialog({ tipo: 'borrar', item: vendor })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dialog?.tipo === 'form' && (
        <VendorForm initial={dialog.item} onClose={close}
          onSave={(body) => (dialog.item.id ? update(dialog.item.id, body) : create(body))} />
      )}
      {dialog?.tipo === 'borrar' && (
        <DeleteModal nombre={`a «${dialog.item.nombre}»`} aviso="Solo se puede si no atiende ningún puesto."
          onClose={close} onConfirm={() => remove(dialog.item.id)} />
      )}
    </>
  )
}
