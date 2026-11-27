import { useState } from 'react'
import useCrudList from '../../hooks/useCrudList'
import { Boton, Campo, EstadoVacio, Skeleton } from '../ui/ui'
import { IcoMas } from '../ui/icons'
import { DeleteModal, FormModal, RowActions } from './RegistryParts'

const EMPTY = { nombre: '', color: '#c81f17', icono: '🌮' }
const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/

// Mismas reglas que el backend
function validate(form) {
  const errors = {}
  if (!form.nombre.trim()) errors.nombre = 'Escribe el nombre del giro.'
  else if (form.nombre.trim().length > 50) errors.nombre = 'Máximo 50 caracteres.'
  if (!COLOR_REGEX.test(form.color)) errors.color = 'Elige un color.'
  if (!form.icono.trim()) errors.icono = 'Escribe un emoji o texto corto.'
  else if (form.icono.trim().length > 10) errors.icono = 'Máximo 10 caracteres.'
  return errors
}

function CategoryForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function submit() {
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return false
    await onSave({ nombre: form.nombre.trim(), color: form.color, icono: form.icono.trim() })
  }

  return (
    <FormModal titulo={initial.id ? 'Editar giro' : 'Agregar giro'} onClose={onClose} onSubmit={submit}>
      <Campo label="Nombre" name="nombre" value={form.nombre} onChange={change} maxLength={50}
        placeholder="Ej. Elotes y esquites" error={errors.nombre} />
      <div className="p-con-preview">
        <div style={{ flex: 1 }}>
          <Campo label="Color" type="color" name="color" value={form.color} onChange={change}
            error={errors.color} style={{ padding: 4 }} />
        </div>
        <span className="p-preview-color" style={{ background: form.color }} aria-hidden />
      </div>
      <div className="p-con-preview">
        <div style={{ flex: 1 }}>
          <Campo label="Icono (emoji)" name="icono" value={form.icono} onChange={change} maxLength={10}
            error={errors.icono} />
        </div>
        <span className="p-preview-emoji" aria-hidden>{form.icono}</span>
      </div>
    </FormModal>
  )
}

export default function CategoriesTab() {
  const { items, loading, create, update, remove } = useCrudList('/categories')
  const [dialog, setDialog] = useState(null) // { tipo: 'form' | 'borrar', item }
  const close = () => setDialog(null)

  return (
    <>
      <div className="p-padron__barra">
        <Boton icono={<IcoMas size={16} />} onClick={() => setDialog({ tipo: 'form', item: EMPTY })}>Agregar giro</Boton>
      </div>

      <div className="p-tabla-wrap" style={{ boxShadow: 'none' }}>
        <table className="p-tabla p-tabla--chica p-tabla--cards p-tabla--fija">
          <caption className="p-sr">Giros</caption>
          <thead>
            <tr><th scope="col">Icono</th><th scope="col">Nombre</th><th scope="col">Color</th><th scope="col"><span className="p-sr">Acciones</span></th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4}><Skeleton /></td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={4}><EstadoVacio titulo="Aún no hay giros" texto="Agrega el primero para poder registrar puestos." /></td></tr>
            )}
            {!loading && items.map((category) => (
              <tr key={category.id}>
                <td data-col="Icono" style={{ fontSize: '1.4rem' }}>{category.icono}</td>
                <td data-col="Nombre"><b>{category.nombre}</b></td>
                <td data-col="Color">
                  <span className="p-chip"><span className="p-chip__dot" style={{ background: category.color }} aria-hidden />{category.color}</span>
                </td>
                <td data-col="Acciones">
                  <RowActions nombre={category.nombre} onEdit={() => setDialog({ tipo: 'form', item: category })}
                    onDelete={() => setDialog({ tipo: 'borrar', item: category })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dialog?.tipo === 'form' && (
        <CategoryForm initial={dialog.item} onClose={close}
          onSave={(body) => (dialog.item.id ? update(dialog.item.id, body) : create(body))} />
      )}
      {dialog?.tipo === 'borrar' && (
        <DeleteModal nombre={`el giro «${dialog.item.nombre}»`} aviso="Solo se puede si ningún puesto lo usa."
          onClose={close} onConfirm={() => remove(dialog.item.id)} />
      )}
    </>
  )
}
