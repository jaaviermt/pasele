import L from 'leaflet'

// Marcador propio: un toldo de tianguis del color del giro, con una insignia
// del estado (icono, no solo color). Se arma como SVG dentro de un divIcon.

const BADGES = {
  en_regla: { fondo: '#1f4d36', simbolo: '✔', texto: '#ffffff' },
  permiso_vencido: { fondo: '#ff5a1f', simbolo: '!', texto: '#111111' },
  fuera_de_zona: { fondo: '#111111', simbolo: '✖', texto: '#ffffff' },
}

function toldoSvg(color, estado) {
  const badge = BADGES[estado]

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="44" viewBox="0 0 40 44" aria-hidden="true">
      <!-- poste -->
      <rect x="18" y="20" width="4" height="22" fill="#111111"/>
      <!-- lona del toldo con orilla en ondas -->
      <path d="M4 10 L20 2 L36 10 L36 18
               Q32 23 28 18 Q24 23 20 18 Q16 23 12 18 Q8 23 4 18 Z"
            fill="${color}" stroke="#111111" stroke-width="2" stroke-linejoin="round"/>
      <!-- franjas claras de la lona -->
      <path d="M12 6 L12 18 M20 2 L20 18 M28 6 L28 18" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
      ${
        badge
          ? `<circle cx="32" cy="32" r="7" fill="${badge.fondo}" stroke="#ffffff" stroke-width="1.5"/>
             <text x="32" y="35.5" text-anchor="middle" font-size="10" font-weight="700"
                   font-family="sans-serif" fill="${badge.texto}">${badge.simbolo}</text>`
          : ''
      }
    </svg>`
}

// Se guardan los iconos ya creados para no rehacerlos en cada render
const cache = new Map()

export function createMarkerIcon(color = '#777777', estado) {
  const key = `${color}-${estado}`
  if (!cache.has(key)) {
    cache.set(
      key,
      L.divIcon({
        html: toldoSvg(color, estado),
        className: 'marcador-puesto',
        iconSize: [40, 44],
        iconAnchor: [20, 42], // la base del poste queda en la coordenada
        popupAnchor: [0, -40],
      }),
    )
  }
  return cache.get(key)
}

// Marcador temporal del punto donde se hizo clic para registrar un puesto
export const newPointIcon = L.divIcon({
  html: '<div class="marcador-nuevo" aria-hidden="true">+</div>',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -14],
})
