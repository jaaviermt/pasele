import { useEffect, useId, useRef } from 'react'
import { IcoAlerta, IcoCheck, IcoFuera, IcoReloj, IcoSpin, IcoX, Toldo } from './icons'
import { getEstado } from '../../utils/estados'

// Componentes base del diseño. Solo presentación: los datos y acciones llegan por props.

export function Boton({ variante = 'primario', chico, cargando, textoCargando = 'Enviando…', icono, children, className, ...props }) {
  const clases = ['p-btn', `p-btn--${variante}`, chico && 'p-btn--chico', cargando && 'p-btn--cargando', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type="button" {...props} className={clases} disabled={props.disabled || cargando}
      aria-busy={cargando || undefined}>
      {cargando ? <IcoSpin size={18} /> : icono}
      {cargando ? textoCargando : children}
    </button>
  )
}

export function Logo({ grande }) {
  return (
    <span className={`p-logo${grande ? ' p-logo--grande' : ''}`}>
      <Toldo size={grande ? 72 : 36} />
      <span className="p-logo__txt">¡Pásele!</span>
    </span>
  )
}

// ---------- Campos de formulario (etiqueta, ayuda y error accesibles) ----------
function useCampo(error, ayuda) {
  const id = useId()
  const describedBy = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return { id, describedBy }
}

function Pie({ id, error, ayuda }) {
  return (
    <>
      {ayuda && <p id={`${id}-ayuda`} className="p-ayuda">{ayuda}</p>}
      {error && <p id={`${id}-error`} className="p-error-campo"><IcoAlerta size={16} />{error}</p>}
    </>
  )
}

export function Campo({ label, error, ayuda, ...props }) {
  const { id, describedBy } = useCampo(error, ayuda)
  return (
    <div className="p-campo">
      <label className="p-label" htmlFor={id}>{label}</label>
      <input id={id} className="p-input" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props} />
      <Pie id={id} error={error} ayuda={ayuda} />
    </div>
  )
}

// opciones: [{ valor, texto }]. "vacio" agrega una primera opción con valor ""
export function Selector({ label, error, ayuda, opciones, vacio, ...props }) {
  const { id, describedBy } = useCampo(error, ayuda)
  return (
    <div className="p-campo">
      <label className="p-label" htmlFor={id}>{label}</label>
      <select id={id} className="p-select" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props}>
        {vacio !== undefined && <option value="">{vacio}</option>}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>{opcion.texto}</option>
        ))}
      </select>
      <Pie id={id} error={error} ayuda={ayuda} />
    </div>
  )
}

export function AreaTexto({ label, error, ayuda, ...props }) {
  const { id, describedBy } = useCampo(error, ayuda)
  return (
    <div className="p-campo">
      <label className="p-label" htmlFor={id}>{label}</label>
      <textarea id={id} className="p-textarea" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props} />
      <Pie id={id} error={error} ayuda={ayuda} />
    </div>
  )
}

export function Casilla({ label, ...props }) {
  return <label className="p-check"><input type="checkbox" {...props} />{label}</label>
}

// Error general de un formulario (ej. lo que respondió el servidor), con lista opcional de detalles
export function AlertaGeneral({ children, detalles = [] }) {
  return (
    <div className="p-alerta" role="alert">
      <IcoAlerta size={22} />
      <div>
        <span>{children}</span>
        {detalles.length > 0 && (
          <ul className="p-alerta__lista">
            {detalles.map((detalle) => <li key={detalle}>{detalle}</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}

// ---------- Estados (siempre icono + texto + color) ----------
const ICONOS_ESTADO = { ok: IcoCheck, vencido: IcoReloj, fuera: IcoFuera }

export function IconoEstado({ estado, size = 14 }) {
  const Icono = ICONOS_ESTADO[getEstado(estado).clase] || IcoAlerta
  return <Icono size={size} />
}

export function InsigniaEstado({ estado }) {
  const { texto, clase } = getEstado(estado)
  return <span className={`p-badge p-badge--${clase}`}><IconoEstado estado={estado} />{texto}</span>
}

export function InsigniaVigencia({ vigente }) {
  return vigente
    ? <span className="p-badge p-badge--ok"><IcoCheck size={14} />Vigente</span>
    : <span className="p-badge p-badge--vencido"><IcoReloj size={14} />Vencido</span>
}

// giro: { nombre, color, icono } tal como llega del backend
export function ChipGiro({ giro }) {
  if (!giro) return '—'
  return (
    <span className="p-chip">
      <span className="p-chip__dot" style={{ background: giro.color }} aria-hidden>{giro.icono}</span>
      {giro.nombre}
    </span>
  )
}

// ---------- Modal ----------
// Usa <dialog> nativo: el navegador atrapa el foco y Escape dispara onCerrar.
export function Modal({ titulo, onCerrar, children }) {
  const dialogRef = useRef(null)
  const tituloId = useId()

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  return (
    <dialog ref={dialogRef} className="p-card p-modal p-dialogo" aria-labelledby={tituloId}
      onCancel={(event) => {
        event.preventDefault() // Escape: que el componente padre decida qué hacer
        onCerrar()
      }}>
      <div className="p-modal__cab">
        <h2 id={tituloId}>{titulo}</h2>
        <button type="button" className="p-icon-btn" onClick={onCerrar} aria-label="Cerrar"><IcoX size={16} /></button>
      </div>
      <div className="p-card__pad">{children}</div>
    </dialog>
  )
}

export function EstadoVacio({ titulo, texto, accion }) {
  return (
    <div className="p-vacio">
      <Toldo size={56} color="#f6b80f" />
      <p className="p-vacio__t">{titulo}</p>
      {texto && <p className="p-ayuda">{texto}</p>}
      {accion}
    </div>
  )
}

export function Skeleton({ ancho = '100%' }) {
  return <span className="p-skel" style={{ width: ancho }} aria-hidden />
}

// Pestañas accesibles: flechas izquierda/derecha para moverse
export function Pestanas({ items, activa, onCambio, etiqueta }) {
  return (
    <div className="p-tabs" role="tablist" aria-label={etiqueta}>
      {items.map((item, index) => (
        <button key={item} role="tab" type="button" className="p-tab" aria-selected={item === activa}
          tabIndex={item === activa ? 0 : -1}
          onClick={() => onCambio(item)}
          onKeyDown={(event) => {
            const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
            if (!step) return
            const nextIndex = (index + step + items.length) % items.length
            onCambio(items[nextIndex])
            event.currentTarget.parentElement?.children[nextIndex]?.focus()
          }}>
          {item}
        </button>
      ))}
    </div>
  )
}
