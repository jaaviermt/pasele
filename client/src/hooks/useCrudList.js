import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useNotice } from '../context/NoticeContext'

// Lista + crear / editar / borrar de un catálogo del backend (giros, comerciantes, permisos).
// Las tres pestañas del Padrón hacen exactamente lo mismo, solo cambia la ruta.
// create/update/remove devuelven el registro y lanzan el error para que el formulario lo muestre.
export default function useCrudList(path) {
  const { showSuccess, showError } = useNotice()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Carga inicial ("loading" ya empieza en true)
  useEffect(() => {
    apiFetch(path)
      .then((response) => setItems(response.data))
      .catch(showError)
      .finally(() => setLoading(false))
  }, [path, showError])

  async function create(body) {
    const response = await apiFetch(path, { method: 'POST', body })
    setItems((current) => [...current, response.data])
    showSuccess(response.message)
    return response.data
  }

  async function update(id, body) {
    const response = await apiFetch(`${path}/${id}`, { method: 'PATCH', body })
    setItems((current) => current.map((item) => (item.id === id ? response.data : item)))
    showSuccess(response.message)
    return response.data
  }

  async function remove(id) {
    const response = await apiFetch(`${path}/${id}`, { method: 'DELETE' })
    setItems((current) => current.filter((item) => item.id !== id))
    showSuccess(response.message)
  }

  return { items, loading, create, update, remove }
}
