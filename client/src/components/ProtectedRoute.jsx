import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { IcoSpin } from './ui/icons'

// Envuelve las vistas internas: sin sesión, manda a la pantalla de acceso.
export default function ProtectedRoute() {
  const { user, checking } = useAuth()

  if (checking) {
    return (
      <div className="p-root p-cargando" role="status">
        <IcoSpin size={28} /> Revisando tu sesión…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/acceso" replace />
  }

  return <Outlet />
}
