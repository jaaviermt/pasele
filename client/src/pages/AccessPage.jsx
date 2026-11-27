import { useState } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useNotice } from '../context/NoticeContext'
import { AlertaGeneral, Boton, Campo, Logo, Pestanas } from '../components/ui/ui'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LOGIN = 'Iniciar sesión'
const REGISTRO = 'Crear cuenta'

// Mismas reglas que el backend, para avisar antes de enviar.
function validate(mode, form) {
  const errors = {}

  if (mode === REGISTRO) {
    if (!form.nombre.trim()) errors.nombre = 'Escribe tu nombre.'
    else if (form.nombre.trim().length > 80) errors.nombre = 'Máximo 80 caracteres.'
  }

  if (!form.email.trim()) errors.email = 'Escribe tu correo.'
  else if (mode === REGISTRO && !EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'El correo no tiene un formato válido.'
  }

  if (!form.password) errors.password = 'Escribe tu contraseña.'
  else if (mode === REGISTRO && form.password.length < 8) errors.password = 'Debe tener al menos 8 caracteres.'
  else if (mode === REGISTRO && form.password.length > 72) errors.password = 'Debe tener máximo 72 caracteres.'

  if (mode === REGISTRO && form.confirmar !== form.password) {
    errors.confirmar = 'Las contraseñas no coinciden.'
  }

  return errors
}

const EMPTY_FORM = { nombre: '', email: '', password: '', confirmar: '' }

// Caja de fecha del cartel con el día de hoy (horario de México)
function FechaDeHoy() {
  const parte = (opciones) =>
    new Date().toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', ...opciones })
  return (
    <div className="p-fecha" aria-label={`Hoy, ${parte({ dateStyle: 'full' })}`}>
      <span className="p-fecha__dia" aria-hidden>{parte({ weekday: 'long' })}</span>
      <span className="p-fecha__num" aria-hidden>{parte({ day: 'numeric' })}</span>
      <span className="p-fecha__mes" aria-hidden>{parte({ month: 'long' })} {parte({ year: 'numeric' })}</span>
    </div>
  )
}

export default function AccessPage() {
  const { user, login, register } = useAuth()
  const { showSuccess, showError } = useNotice()

  const [mode, setMode] = useState(LOGIN)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [sending, setSending] = useState(false)

  // Si ya hay sesión, no tiene caso mostrar el acceso
  if (user) {
    return <Navigate to="/" replace />
  }

  function changeMode(newMode) {
    setMode(newMode)
    setErrors({})
    setServerError(null)
    setForm((current) => ({ ...EMPTY_FORM, email: current.email }))
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError(null)

    const found = validate(mode, form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSending(true)
    try {
      if (mode === LOGIN) {
        await login(form.email.trim(), form.password)
        showSuccess('Bienvenido de vuelta.')
      } else {
        await register(form.nombre.trim(), form.email.trim(), form.password)
        showSuccess('Tu cuenta quedó creada.')
      }
      // Al cambiar "user", el <Navigate> de arriba lleva al mapa
    } catch (error) {
      // El mensaje queda fijo en el formulario y también sale como aviso
      setServerError(error)
      showError(error)
    } finally {
      setSending(false)
    }
  }

  const field = (name) => ({ name, value: form[name], onChange: handleChange, error: errors[name] })

  return (
    <div className="p-root p-acceso">
      <div><div className="p-papel-picado" /><div className="p-toldo" /></div>

      <main className="p-acceso__main">
        {/* Lado izquierdo: el cartel */}
        <div className="p-acceso__cartel">
          <p className="p-regla">Tianguis en el mapa</p>
          <h1 style={{ margin: 0 }} className="p-destellos"><Logo grande /></h1>
          <p className="p-acceso__lema">Cada puesto en su lugar y con su permiso</p>

          <div className="p-acceso__fila">
            <FechaDeHoy />
            {/* Line-up del tianguis, de mayor a menor como en un cartel */}
            <ul className="p-lineup" aria-label="Giros del tianguis">
              <li>Antojitos · Frutas · Ropa de paca</li>
              <li>Fierros viejos · Dulces típicos · Plantas</li>
              <li>Chácharas · Elotes · Juguetes · Flores · Y más</li>
            </ul>
          </div>

          <p className="p-acceso__texto">
            Ubica los puestos del tianguis en el mapa, sabe quién los atiende y qué permisos están al día.
          </p>
          <div className="p-rayos" aria-hidden />
        </div>

        <div className="p-card p-marco-filete p-acceso__formulario">
          <div style={{ padding: '16px 16px 0' }}>
            <Pestanas etiqueta="Acceso" items={[LOGIN, REGISTRO]} activa={mode} onCambio={changeMode} />
          </div>

          <form className="p-card__pad" onSubmit={handleSubmit} noValidate role="tabpanel" aria-label={mode}>
            {serverError && <AlertaGeneral detalles={serverError.details}>{serverError.message}</AlertaGeneral>}

            {mode === LOGIN ? (
              <>
                <Campo label="Correo" type="email" autoComplete="email" placeholder="tucorreo@ejemplo.mx" {...field('email')} />
                <Campo label="Contraseña" type="password" autoComplete="current-password" {...field('password')} />
                <Boton type="submit" cargando={sending} style={{ width: '100%' }}>Entrar</Boton>
              </>
            ) : (
              <>
                <Campo label="Nombre" autoComplete="name" {...field('nombre')} />
                <Campo label="Correo" type="email" autoComplete="email" {...field('email')} />
                <Campo label="Contraseña" type="password" autoComplete="new-password" ayuda="Mínimo 8 caracteres"
                  {...field('password')} />
                <Campo label="Confirmar contraseña" type="password" autoComplete="new-password" {...field('confirmar')} />
                <Boton type="submit" variante="azul" cargando={sending} style={{ width: '100%' }}>Crear cuenta</Boton>
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
