import { useState } from 'react'
import { AlertaGeneral, Boton, Campo, Casilla, Modal } from '../ui/ui'
import { DIAS } from '../../utils/dias'

// Ventana que aparece al terminar de dibujar una zona: pide nombre y días.
export default function ZoneDialog({ onSave, onDiscard }) {
  const [nombre, setNombre] = useState('')
  const [dias, setDias] = useState([])
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState(null)
  const [sending, setSending] = useState(false)

  function toggleDia(valor) {
    setDias((current) =>
      current.includes(valor) ? current.filter((dia) => dia !== valor) : [...current, valor],
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError(null)
    if (!nombre.trim()) return setError('Escribe el nombre de la zona.')
    if (nombre.trim().length > 80) return setError('Máximo 80 caracteres.')

    setError('')
    setSending(true)
    try {
      await onSave({ nombre: nombre.trim(), dias })
    } catch (saveError) {
      // Se queda abierto para corregir (ej. nombre repetido o polígono inválido)
      setServerError(saveError)
      setSending(false)
    }
  }

  return (
    <Modal titulo="Nueva zona" onCerrar={onDiscard}>
      <form onSubmit={handleSubmit} noValidate>
        {serverError && <AlertaGeneral detalles={serverError.details}>{serverError.message}</AlertaGeneral>}

        <Campo label="Nombre de la zona" placeholder="Ej. Tianguis del Centro" value={nombre}
          onChange={(event) => setNombre(event.target.value)} maxLength={80} autoFocus error={error} />

        <fieldset className="p-checks">
          <legend className="p-label">Días que se pone (opcional)</legend>
          {DIAS.map((dia) => (
            <Casilla key={dia.valor} label={dia.texto} checked={dias.includes(dia.valor)}
              onChange={() => toggleDia(dia.valor)} />
          ))}
        </fieldset>

        <div className="p-acciones">
          <Boton type="submit" cargando={sending} textoCargando="Guardando…">Guardar zona</Boton>
          <Boton variante="fantasma" onClick={onDiscard}>Descartar</Boton>
        </div>
      </form>
    </Modal>
  )
}
