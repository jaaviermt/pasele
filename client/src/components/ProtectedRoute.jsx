import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'

// Envuelve las vistas internas: sin sesión, manda a la pantalla de acceso.
export default function ProtectedRoute() {
  const { user, checking } = useAuth()

  if (checking) {
    return <p className="cargando">Revisando tu sesión…</p>
  }

  if (!user) {
    return <Navigate to="/acceso" replace />
  }

  return <Outlet />
}
