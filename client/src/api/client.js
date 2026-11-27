// Única función para hablar con el backend. Agrega el token y convierte
// las respuestas de error en un Error con el mensaje del servidor.

const API_URL = import.meta.env.VITE_API_URL
const TOKEN_KEY = 'pasele_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// Evento que escucha AuthContext para cerrar la sesión cuando el token ya no sirve
export const SESSION_EXPIRED_EVENT = 'pasele:sesion-expirada'

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const token = getToken()
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.')
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    // Si mandamos token y el servidor respondió 401, la sesión venció
    if (response.status === 401 && token) {
      clearToken()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }

    const error = new Error(data?.error?.message || 'Ocurrió un error inesperado.')
    error.status = response.status
    error.details = data?.error?.details || []
    throw error
  }

  return data
}
