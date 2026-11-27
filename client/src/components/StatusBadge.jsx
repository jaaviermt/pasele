import { getEstado } from '../utils/estados'

// Insignia de estado: siempre icono + texto, no solo color.
export default function StatusBadge({ estado }) {
  const { texto, icono, clase } = getEstado(estado)

  return (
    <span className={`estado ${clase}`}>
      <span aria-hidden="true">{icono}</span> {texto}
    </span>
  )
}
