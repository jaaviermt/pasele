import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useNotice } from '../context/NoticeContext'

// Encabezado con la navegación de las vistas internas.
export default function Layout() {
  const { user, logout } = useAuth()
  const { showSuccess } = useNotice()

  function handleLogout() {
    logout()
    showSuccess('Cerraste sesión.')
  }

  return (
    <>
      <header className="encabezado">
        <h1 className="encabezado__titulo rotulo">¡Pásele!</h1>

        <nav className="encabezado__nav" aria-label="Navegación principal">
          <NavLink to="/" end>
            Mapa
          </NavLink>
          <NavLink to="/padron">Padrón</NavLink>
        </nav>

        <div className="encabezado__usuario">
          <span>Hola, {user.nombre}</span>
          <button type="button" className="boton boton--secundario" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="contenido">
        <Outlet />
      </main>
    </>
  )
}
