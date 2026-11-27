// Formatos para mostrar datos en pantalla.

export function formatDateTime(isoDate) {
  if (!isoDate) return '—'
  return new Date(isoDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
}

// 6 decimales ≈ 10 cm de precisión, suficiente para ubicar un puesto
export function formatCoordinate(value) {
  return typeof value === 'number' ? value.toFixed(6) : '—'
}
