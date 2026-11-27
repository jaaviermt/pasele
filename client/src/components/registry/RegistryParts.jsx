import { useState } from 'react'
import { AlertaGeneral, Boton, Modal } from '../ui/ui'
import { IcoBote, IcoLapiz } from '../ui/icons'

// Piezas que comparten las tres pestañas del Padrón.

// Botones de editar y borrar de cada fila
export function RowActions({ nombre, onEdit, onDelete }) {
  return (
    <div className="p-fila-acciones">
      <button type="button" className="p-icon-btn" aria-label={`Editar ${nombre}`} onClick={onEdit}>
        <IcoLapiz size={16} />
      </button>
      <button type="button" className="p-icon-btn" aria-label={`Borrar ${nombre}`} onClick={onDelete}>
        <IcoBote size={16} />
      </button>
    </div>
  )
}

// Modal de formulario: muestra el error del servidor y no se cierra si falla.
// onSubmit debe lanzar el error si el guardado falla.
export function FormModal({ titulo, onClose, onSubmit, children }) {
  const [serverError, setServerError] = useState(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError(null)
    setSending(true)
    try {
      const ok = await onSubmit()
      if (ok !== false) onClose() // onSubmit devuelve false si la validación local falló
    } catch (error) {
      setServerError(error)
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal titulo={titulo} onCerrar={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {serverError && <AlertaGeneral detalles={serverError.details}>{serverError.message}</AlertaGeneral>}
        {children}
        <div className="p-acciones">
          <Boton type="submit" cargando={sending} textoCargando="Guardando…">Guardar</Boton>
          <Boton variante="fantasma" onClick={onClose}>Cancelar</Boton>
        </div>
      </form>
    </Modal>
  )
}

// Confirmación de borrado. Si el servidor lo impide (ej. giro en uso), muestra el motivo.
export function DeleteModal({ nombre, aviso, onClose, onConfirm }) {
  const [serverError, setServerError] = useState(null)
  const [sending, setSending] = useState(false)

  async function handleConfirm() {
    setSending(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      setServerError(error)
      setSending(false)
    }
  }

  return (
    <Modal titulo="Confirmar borrado" onCerrar={onClose}>
      {serverError ? (
        <AlertaGeneral detalles={serverError.details}>{serverError.message}</AlertaGeneral>
      ) : (
        <p>
          ¿Borrar <b>{nombre}</b>? {aviso} Esta acción no se puede deshacer.
        </p>
      )}
      <div className="p-acciones">
        {!serverError && (
          <Boton cargando={sending} textoCargando="Borrando…" onClick={handleConfirm}>Sí, borrar</Boton>
        )}
        <Boton variante="fantasma" onClick={onClose}>{serverError ? 'Entendido' : 'Cancelar'}</Boton>
      </div>
    </Modal>
  )
}
