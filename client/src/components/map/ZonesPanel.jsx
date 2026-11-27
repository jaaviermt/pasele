import { useState } from 'react'
import { formatDias } from '../../utils/dias'

// Lista de zonas guardadas con botón para eliminar (confirmación en la misma fila).
export default function ZonesPanel({ zones, onDelete }) {
  const [confirmingId, setConfirmingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function handleDelete(id) {
    setDeletingId(id)
    try {
      await onDelete(id)
    } catch {
      // El aviso de error ya se mostró
    } finally {
      setDeletingId(null)
      setConfirmingId(null)
    }
  }

  return (
    <aside className="panel-zonas" aria-labelledby="titulo-zonas">
      <h2 id="titulo-zonas">Zonas ({zones.length})</h2>
      <p className="panel-zonas__ayuda">
        Dibuja una zona con el botón de polígono o rectángulo en el mapa.
      </p>

      {zones.length === 0 ? (
        <p>Todavía no hay zonas.</p>
      ) : (
        <ul className="panel-zonas__lista">
          {zones.map((zone) => (
            <li key={zone.id}>
              <strong>{zone.nombre}</strong>
              <span className="panel-zonas__dias">{formatDias(zone.dias)}</span>

              {confirmingId === zone.id ? (
                <div className="panel-zonas__confirmar" role="group" aria-label={`Confirmar eliminar ${zone.nombre}`}>
                  <span>¿Eliminar esta zona?</span>
                  <button type="button" className="boton boton--peligro"
                    onClick={() => handleDelete(zone.id)} disabled={deletingId === zone.id}>
                    {deletingId === zone.id ? 'Eliminando…' : 'Sí, eliminar'}
                  </button>
                  <button type="button" className="boton boton--secundario" onClick={() => setConfirmingId(null)}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <button type="button" className="boton boton--secundario"
                  onClick={() => setConfirmingId(zone.id)} aria-label={`Eliminar zona ${zone.nombre}`}>
                  Eliminar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
