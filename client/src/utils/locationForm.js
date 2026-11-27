// Datos y validación del formulario de puesto (alta y edición en el popup).
// Las reglas son las mismas que valida el backend.

export const EMPTY_LOCATION_FORM = { nombre: '', descripcion: '', category: '', vendor: '' }

// Convierte un puesto que viene del backend (con populate) a valores del formulario
export function locationToForm(location) {
  return {
    nombre: location.nombre,
    descripcion: location.descripcion,
    category: location.category?.id || '',
    vendor: location.vendor?.id || '',
  }
}

export function validateLocationForm(form) {
  const errors = {}

  if (!form.nombre.trim()) errors.nombre = 'Escribe el nombre del puesto.'
  else if (form.nombre.trim().length > 80) errors.nombre = 'Máximo 80 caracteres.'

  if (!form.descripcion.trim()) errors.descripcion = 'Escribe una descripción.'
  else if (form.descripcion.trim().length > 250) errors.descripcion = 'Máximo 250 caracteres.'

  if (!form.category) errors.category = 'Elige un giro.'

  return errors
}

// Lo que se manda al backend. vendor vacío = sin comerciante (null)
export function formToBody(form) {
  return {
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    category: form.category,
    vendor: form.vendor || null,
  }
}
