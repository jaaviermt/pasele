import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useNotice } from '../context/NoticeContext'
import { Boton, Logo } from './ui/ui'
import { IcoLista, IcoMapa, IcoSalir } from './ui/icons'

// Encabezado con la navegación de las vistas internas.
// NavLink pone aria-current="page" en el enlace activo; el CSS lo resalta con eso.
export default function Layout() {
  const { user, logout } = useAuth()
  const { showSuccess } = useNotice()

  function handleLogout() {
    logout()
    showSuccess('Cerraste sesión.')
  }

  return (
    <div className="p-root p-con-bottomnav">
      <header className="p-header">
        <div className="p-header__in">
          <Link to="/" aria-label="¡Pásele! inicio" className="p-header__logo"><Logo /></Link>

          <nav className="p-nav" aria-label="Principal">
            <NavLink to="/" end><IcoMapa size={18} />Mapa</NavLink>
            <NavLink to="/padron"><IcoLista size={18} />Padrón</NavLink>
          </nav>

          <div className="p-header__user">
            <span className="p-hola">Hola, {user.nombre}</span>
            <Boton variante="secundario" chico icono={<IcoSalir size={16} />} onClick={handleLogout}>
              Cerrar sesión
            </Boton>
          </div>
        </div>
      </header>

      {/* En pantallas chicas la navegación pasa abajo */}
      <nav className="p-bottomnav" aria-label="Principal móvil">
        <NavLink to="/" end><IcoMapa size={22} />Mapa</NavLink>
        <NavLink to="/padron"><IcoLista size={22} />Padrón</NavLink>
      </nav>

      <div className="p-toldo" />
      <Outlet />
    </div>
  )
}
