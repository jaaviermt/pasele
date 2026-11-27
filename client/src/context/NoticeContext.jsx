import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Avisos de éxito y error que aparecen en la esquina y se cierran solos.
const NoticeContext = createContext(null)

const DURATION_MS = 5000
let nextId = 1

export function NoticeProvider({ children }) {
  const [notices, setNotices] = useState([])

  const dismiss = useCallback((id) => {
    setNotices((current) => current.filter((notice) => notice.id !== id))
  }, [])

  const show = useCallback(
    (type, message, details = []) => {
      const id = nextId++
      setNotices((current) => [...current, { id, type, message, details }])
      setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      showSuccess: (message) => show('exito', message),
      // Acepta un Error del apiFetch para mostrar también sus detalles
      showError: (errorOrMessage) =>
        typeof errorOrMessage === 'string'
          ? show('error', errorOrMessage)
          : show('error', errorOrMessage.message, errorOrMessage.details),
    }),
    [show],
  )

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <div className="avisos" aria-live="polite">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`aviso aviso--${notice.type}`}
            role={notice.type === 'error' ? 'alert' : 'status'}
          >
            {/* Icono y texto además del color */}
            <span className="aviso__icono" aria-hidden="true">
              {notice.type === 'error' ? '✖' : '✔'}
            </span>
            <div className="aviso__texto">
              <strong>{notice.type === 'error' ? 'Error: ' : 'Listo: '}</strong>
              {notice.message}
              {notice.details?.length > 0 && (
                <ul>
                  {notice.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              className="aviso__cerrar"
              onClick={() => dismiss(notice.id)}
              aria-label="Cerrar aviso"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NoticeContext.Provider>
  )
}

export function useNotice() {
  return useContext(NoticeContext)
}
