import { useState } from 'react'
import { Boton } from '../ui/ui'
import { IcoBote } from '../ui/icons'
import { formatDias } from '../../utils/dias'
import { zoneColor } from '../../utils/zonas'

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
    <aside className="p-card p-zonas" aria-labelledby="zonas-titulo">
      <h2 id="zonas-titulo" className="p-h3" style={{ color: 'var(--p-rojo)' }}>Zonas ({zones.length})</h2>

      {zones.length === 0 ? (
        <p className="p-ayuda">Aún no hay zonas. Usa «Dibujar zona» en el mapa.</p>
      ) : (
        <ul>
          {zones.map((zone) => (
            <li key={zone.id}>
              <span className="p-zonas__sw" style={{ background: zoneColor(zone.id) }} aria-hidden />
              <div style={{ minWidth: 0 }}>
                <b>{zone.nombre}</b>
                <div className="p-zonas__dias">{formatDias(zone.dias)}</div>
              </div>

              {confirmingId === zone.id ? (
                <div className="p-zonas__confirmar" role="group" aria-label={`Confirmar eliminar ${zone.nombre}`}>
                  <span>¿Eliminar?</span>
                  <Boton chico variante="primario" cargando={deletingId === zone.id} textoCargando="…"
                    onClick={() => handleDelete(zone.id)}>Sí</Boton>
                  <Boton chico variante="fantasma" onClick={() => setConfirmingId(null)}>No</Boton>
                </div>
              ) : (
                <button type="button" className="p-icon-btn" aria-label={`Eliminar zona ${zone.nombre}`}
                  onClick={() => setConfirmingId(zone.id)}>
                  <IcoBote size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
