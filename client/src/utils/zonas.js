// Color de cada zona en el mapa y en el panel. No se guarda en la base:
// se elige de una paleta a partir del id, así una zona siempre tiene el mismo color.
const PALETA = ['#1c4fb5', '#d4231c', '#1f8a4c', '#ee5a24', '#7a1616']

// Suma estable de los caracteres del id: el mismo id siempre da el mismo número
function hashId(id) {
  let suma = 0
  for (const char of id) suma += char.charCodeAt(0)
  return suma
}

export function zoneColor(id = '') {
  return PALETA[hashId(id) % PALETA.length]
}
