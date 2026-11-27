// Formatos para mostrar datos en pantalla.

const TIME_ZONE = 'America/Mexico_City'

export function formatDateTime(isoDate) {
  if (!isoDate) return '—'
  return new Date(isoDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
}

// Fechas sin hora (ej. vigenteHasta): se guardan a las 00:00 UTC,
// así que se muestran en UTC para que no cambien de día por la zona horaria.
export function formatDate(isoDate) {
  if (!isoDate) return '—'
  return new Date(isoDate).toLocaleDateString('es-MX', {
    timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric',
  })
}

// "AAAA-MM-DD" de una fecha ISO, para <input type="date">
export function toDateInput(isoDate) {
  return isoDate ? isoDate.slice(0, 10) : ''
}

// Hoy en México como "AAAA-MM-DD" (igual que lo calcula el backend)
export function todayInMexico() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date())
}

export function formatMoney(amount) {
  return Number(amount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

// 4771234567 -> 47 7123 4567
export function formatPhone(phone) {
  return phone ? phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3') : '—'
}

// 6 decimales ≈ 10 cm de precisión, suficiente para ubicar un puesto.
export function formatCoordinate(value) {
  return typeof value === 'number' ? value.toFixed(6) : '—'
}
