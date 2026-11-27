import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

// Pantalla temporal de la fase 0: solo comprueba que el client llega al server.
function App() {
  const [estado, setEstado] = useState('Comprobando servidor…')

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((body) => setEstado(body.data.message))
      .catch(() => setEstado('No se pudo conectar con el servidor'))
  }, [])

  return (
    <main>
      <h1>¡Pásele!</h1>
      <p>{estado}</p>
    </main>
  )
}

export default App
