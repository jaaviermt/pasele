import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch, clearToken, getToken, saveToken, SESSION_EXPIRED_EVENT } from '../api/client'
import { useNotice } from './NoticeContext'

// Guarda quién inició sesión y ofrece login, registro y logout a toda la app.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // true mientras se revisa si el token guardado sigue siendo válido
  const [checking, setChecking] = useState(Boolean(getToken()))
  const { showError } = useNotice()

  // Al abrir la app: si hay token, se pide el usuario a /auth/me
  useEffect(() => {
    if (!getToken()) return

    apiFetch('/auth/me')
      .then((response) => setUser(response.data))
      .catch(() => clearToken())
      .finally(() => setChecking(false))
  }, [])

  // Si cualquier petición recibe 401, se cierra la sesión y se avisa
  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      showError('Tu sesión expiró. Inicia sesión de nuevo.')
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [showError])

  async function login(email, password) {
    const response = await apiFetch('/auth/login', { method: 'POST', body: { email, password } })
    saveToken(response.data.token)
    setUser(response.data.user)
  }

  async function register(nombre, email, password) {
    const response = await apiFetch('/auth/register', {
      method: 'POST',
      body: { nombre, email, password },
    })
    saveToken(response.data.token)
    setUser(response.data.user)
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, checking, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
