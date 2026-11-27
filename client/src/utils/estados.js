// Texto y clase de cada estado del puesto (la clase elige color e icono en el diseño).
// El estado lo calcula el backend; aquí solo se decide cómo mostrarlo.
export const ESTADOS = {
  en_regla: { texto: 'En regla', clase: 'ok' },
  permiso_vencido: { texto: 'Permiso vencido', clase: 'vencido' },
  fuera_de_zona: { texto: 'Fuera de zona', clase: 'fuera' },
}

export function getEstado(clave) {
  return ESTADOS[clave] || { texto: 'Sin estado', clase: '' }
}
