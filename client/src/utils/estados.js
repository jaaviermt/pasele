// Texto, icono y clase CSS de cada estado del puesto.
// El estado lo calcula el backend; aquí solo se decide cómo mostrarlo.
export const ESTADOS = {
  en_regla: { texto: 'En regla', icono: '✔', clase: 'estado--en-regla' },
  permiso_vencido: { texto: 'Permiso vencido', icono: '!', clase: 'estado--vencido' },
  fuera_de_zona: { texto: 'Fuera de zona', icono: '✖', clase: 'estado--fuera' },
}

export function getEstado(clave) {
  return ESTADOS[clave] || { texto: 'Sin estado', icono: '?', clase: '' }
}
