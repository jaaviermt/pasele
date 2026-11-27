// Iconos SVG propios (trazo de 24×24) y el toldo de tianguis del logo y los marcadores.

const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
})

export const IcoCheck = ({ size, ...p }) => <svg {...base(size)} {...p}><path d="M4 12.5l5 5L20 6.5" /></svg>
export const IcoReloj = ({ size, ...p }) => <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
export const IcoFuera = ({ size, ...p }) => <svg {...base(size)} {...p}><path d="M12 3l10 18H2z" /><path d="M12 10v4M12 17.5v.5" /></svg>
export const IcoX = ({ size, ...p }) => <svg {...base(size)} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
export const IcoAlerta = ({ size, ...p }) => <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" /></svg>
export const IcoMapa = ({ size, ...p }) => <svg {...base(size)} {...p}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v14M15 6v14" /></svg>
export const IcoLista = ({ size, ...p }) => <svg {...base(size)} {...p}><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></svg>
export const IcoSalir = ({ size, ...p }) => <svg {...base(size)} {...p}><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></svg>
export const IcoLapiz = ({ size, ...p }) => <svg {...base(size)} {...p}><path d="M4 20l1-5L16 4l4 4L9 19z" /><path d="M13.5 6.5l4 4" /></svg>
export const IcoBote = ({ size, ...p }) => <svg {...base(size)} {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
export const IcoMas = ({ size, ...p }) => <svg {...base(size)} {...p}><path d="M12 5v14M5 12h14" /></svg>
export const IcoLapizZona = ({ size, ...p }) => (
  <svg {...base(size)} {...p}>
    <path d="M4 18l4-12 9 3 3 9z" strokeDasharray="3 3" />
    <circle cx="4" cy="18" r="1.6" fill="currentColor" />
    <circle cx="8" cy="6" r="1.6" fill="currentColor" />
    <circle cx="17" cy="9" r="1.6" fill="currentColor" />
  </svg>
)
export const IcoSpin = ({ size, ...p }) => <svg {...base(size)} className="p-spin" {...p}><path d="M12 3a9 9 0 1 1-9 9" /></svg>
export const IcoEstrella = ({ size = 24, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...p}>
    <path d="M12 1l2.6 8.4H23l-6.8 5 2.6 8.6L12 17.8 5.2 23l2.6-8.6L1 9.4h8.4z" fill="currentColor" />
  </svg>
)

// Toldo de tianguis a rayas (logo, estado vacío y contador total)
export function Toldo({ color = '#c81f17', size = 44 }) {
  const stripes = [0, 1, 2, 3, 4, 5]
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 44 50" aria-hidden>
      <path d="M22 2 L42 14 L2 14 Z" fill={color} stroke="#1d1410" strokeWidth="2.5" strokeLinejoin="round" />
      {stripes.map((i) => (
        <path key={i} d={`M${2 + i * 6.67} 14 h6.67 v6 a3.33 3.33 0 0 1 -6.67 0 z`}
          fill={i % 2 ? '#fff' : color} stroke="#1d1410" strokeWidth="2" />
      ))}
      <rect x="6" y="22" width="32" height="12" fill="#fff8e6" stroke="#1d1410" strokeWidth="2" />
      <path d="M8 34 V46 M36 34 V46" stroke="#1d1410" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 46 L16 36 H28 Z" fill="#1d1410" />
    </svg>
  )
}
