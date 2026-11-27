import { useState } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useNotice } from '../context/NoticeContext'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Mismas reglas que el backend, para avisar antes de enviar
function validate(mode, form) {
  const errors = {}

  if (mode === 'registro') {
    if (!form.nombre.trim()) errors.nombre = 'Escribe tu nombre.'
    else if (form.nombre.trim().length > 80) errors.nombre = 'Máximo 80 caracteres.'
  }

  if (!form.email.trim()) errors.email = 'Escribe tu correo.'
  else if (mode === 'registro' && !EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'El correo no tiene un formato válido.'
  }

  if (!form.password) errors.password = 'Escribe tu contraseña.'
  else if (mode === 'registro' && form.password.length < 8) {
    errors.password = 'Debe tener al menos 8 caracteres.'
  } else if (mode === 'registro' && form.password.length > 72) {
    errors.password = 'Debe tener máximo 72 caracteres.'
  }

  if (mode === 'registro' && form.confirmar !== form.password) {
    errors.confirmar = 'Las contraseñas no coinciden.'
  }

  return errors
}

const EMPTY_FORM = { nombre: '', email: '', password: '', confirmar: '' }

export default function AccessPage() {
  const { user, login, register } = useAuth()
  const { showSuccess, showError } = useNotice()

  const [mode, setMode] = useState('login') // 'login' | 'registro'
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
      if (mode === 'login') {
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

  const isLogin = mode === 'login'

  return (
    <div className="acceso">
      <section className="acceso__panel">
        <h1 className="acceso__titulo">¡Pásele!</h1>
        <p className="acceso__lema">Cada puesto en su lugar y en regla.</p>

        <div className="acceso__pestanas" role="tablist" aria-label="Tipo de acceso">
          <button
            type="button"
            role="tab"
            aria-selected={isLogin}
            className={isLogin ? 'activa' : ''}
            onClick={() => changeMode('login')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLogin}
            className={!isLogin ? 'activa' : ''}
            onClick={() => changeMode('registro')}
          >
            Crear cuenta
          </button>
        </div>

        <form className="formulario" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <Field label="Nombre" name="nombre" value={form.nombre} error={errors.nombre}
              onChange={handleChange} autoComplete="name" />
          )}

          <Field label="Correo" name="email" type="email" value={form.email} error={errors.email}
            onChange={handleChange} autoComplete="email" />

          <Field label="Contraseña" name="password" type="password" value={form.password}
            error={errors.password} onChange={handleChange}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            hint={!isLogin ? 'Mínimo 8 caracteres.' : undefined} />

          {!isLogin && (
            <Field label="Confirmar contraseña" name="confirmar" type="password"
              value={form.confirmar} error={errors.confirmar} onChange={handleChange}
              autoComplete="new-password" />
          )}

          {serverError && (
            <div className="formulario__error" role="alert">
              <strong>{serverError.message}</strong>
              {serverError.details?.length > 0 && (
                <ul>
                  {serverError.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button type="submit" className="boton boton--primario" disabled={sending}>
            {sending ? 'Enviando…' : isLogin ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
      </section>
    </div>
  )
}

// Campo con etiqueta y mensaje de error accesible
function Field({ label, name, error, hint, ...inputProps }) {
  const errorId = `${name}-error`
  const hintId = `${name}-ayuda`
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className="campo">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} aria-invalid={Boolean(error)} aria-describedby={describedBy}
        {...inputProps} />
      {hint && !error && <small id={hintId}>{hint}</small>}
      {error && <small id={errorId} className="campo__error">{error}</small>}
    </div>
  )
}
