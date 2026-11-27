import { useEffect, useRef, useState } from 'react'
import { DIAS } from '../../utils/dias'

// Ventana que aparece al terminar de dibujar una zona: pide nombre y días.
// Usa <dialog> nativo: atrapa el foco y se cierra con Escape.
export default function ZoneDialog({ onSave, onDiscard }) {
  const dialogRef = useRef(null)
  const [nombre, setNombre] = useState('')
  const [dias, setDias] = useState([])
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  function toggleDia(valor) {
    setDias((current) =>
      current.includes(valor) ? current.filter((dia) => dia !== valor) : [...current, valor],
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!nombre.trim()) {
      setError('Escribe el nombre de la zona.')
      return
    }
    if (nombre.trim().length > 80) {
      setError('Máximo 80 caracteres.')
      return
    }

    setError('')
    setSending(true)
    try {
      await onSave({ nombre: nombre.trim(), dias })
    } catch (saveError) {
      // Se queda abierto para corregir (ej. nombre repetido o polígono inválido)
      setError(saveError.message)
      setSending(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialogo"
      aria-labelledby="dialogo-zona-titulo"
      onCancel={(event) => {
        event.preventDefault() // Escape: lo manejamos nosotros para quitar el trazo
        onDiscard()
      }}
    >
      <form className="formulario" onSubmit={handleSubmit} noValidate>
        <h2 id="dialogo-zona-titulo">Nueva zona</h2>

        <div className="campo">
          <label htmlFor="zona-nombre">Nombre del tianguis</label>
          <input id="zona-nombre" value={nombre} onChange={(event) => setNombre(event.target.value)}
            maxLength={80} autoFocus aria-invalid={Boolean(error)}
            aria-describedby={error ? 'zona-error' : undefined} />
        </div>

        <fieldset className="campo campo--dias">
          <legend>Días que se pone (opcional)</legend>
          {DIAS.map((dia) => (
            <label key={dia.valor} className="casilla">
              <input type="checkbox" checked={dias.includes(dia.valor)}
                onChange={() => toggleDia(dia.valor)} />
              {dia.texto}
            </label>
          ))}
        </fieldset>

        {error && <p id="zona-error" className="formulario__error" role="alert">{error}</p>}

        <div className="popup__acciones">
          <button type="submit" className="boton boton--primario" disabled={sending}>
            {sending ? 'Guardando…' : 'Guardar zona'}
          </button>
          <button type="button" className="boton boton--secundario" onClick={onDiscard}>
            Descartar
          </button>
        </div>
      </form>
    </dialog>
  )
}
