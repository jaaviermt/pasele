// Días válidos (como los guarda el backend, sin acentos) y su texto para mostrar.
export const DIAS = [
  { valor: 'lunes', texto: 'Lunes' },
  { valor: 'martes', texto: 'Martes' },
  { valor: 'miercoles', texto: 'Miércoles' },
  { valor: 'jueves', texto: 'Jueves' },
  { valor: 'viernes', texto: 'Viernes' },
  { valor: 'sabado', texto: 'Sábado' },
  { valor: 'domingo', texto: 'Domingo' },
]

export function formatDias(dias = []) {
  if (dias.length === 0) return 'Sin días asignados'
  return DIAS.filter((dia) => dias.includes(dia.valor))
    .map((dia) => dia.texto)
    .join(', ')
}
