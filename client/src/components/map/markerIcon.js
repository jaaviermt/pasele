import L from 'leaflet'

// Marcador del diseño (.p-marcador): toldo del color del giro, su emoji y una
// insignia de estado con icono. Leaflet necesita HTML en texto (divIcon), por eso
// se arma aquí como cadena en lugar de usar los componentes de React.

const INK = '#1d1410'

function toldoSvg(color) {
  const stripes = [0, 1, 2, 3, 4, 5]
    .map((i) => `<path d="M${2 + i * 6.67} 14 h6.67 v6 a3.33 3.33 0 0 1 -6.67 0 z" fill="${i % 2 ? '#fff' : color}" stroke="${INK}" stroke-width="2"/>`)
    .join('')
  return `
    <svg width="52" height="60" viewBox="0 0 44 50" aria-hidden="true">
      <path d="M22 2 L42 14 L2 14 Z" fill="${color}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      ${stripes}
      <rect x="6" y="22" width="32" height="12" fill="#fff8e6" stroke="${INK}" stroke-width="2"/>
      <path d="M8 34 V46 M36 34 V46" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M22 46 L16 36 H28 Z" fill="${INK}"/>
    </svg>`
}

// Mismos trazos que IcoCheck, IcoReloj e IcoFuera
const STATUS_ICONS = {
  en_regla: { clase: 'ok', path: '<path d="M4 12.5l5 5L20 6.5"/>' },
  permiso_vencido: { clase: 'vencido', path: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
  fuera_de_zona: { clase: 'fuera', path: '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.5"/>' },
}

function statusBadge(estado) {
  const status = STATUS_ICONS[estado]
  if (!status) return ''
  return `
    <span class="p-marcador__estado p-marcador__estado--${status.clase}">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${status.path}</svg>
    </span>`
}

// El emoji lo escribe el usuario: se escapa para que no se pueda inyectar HTML
function escapeHtml(text = '') {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

const cache = new Map()

export function createMarkerIcon(category, estado) {
  // El color ya viene validado como hexadecimal por el backend
  const color = category?.color || '#4a3b31'
  const icono = category?.icono || ''
  const key = `${color}|${icono}|${estado}`

  if (!cache.has(key)) {
    cache.set(
      key,
      L.divIcon({
        html: `
          <span class="p-marcador">
            ${toldoSvg(color)}
            <span class="p-marcador__emoji" aria-hidden="true">${escapeHtml(icono)}</span>
            ${statusBadge(estado)}
          </span>`,
        className: 'marcador-puesto', // quita el fondo blanco por defecto de Leaflet
        iconSize: [52, 60],
        iconAnchor: [26, 58], // la base del toldo queda en la coordenada
        popupAnchor: [0, -54],
      }),
    )
  }
  return cache.get(key)
}

// Marcador temporal del punto donde se hizo clic para registrar un puesto
export const newPointIcon = L.divIcon({
  html: '<div class="marcador-nuevo" aria-hidden="true">+</div>',
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -16],
})
