import { EstadoVacio } from '../components/ui/ui'

// Padrón: permisos, comerciantes y giros (se construye en la fase 7).
export default function RegistryPage() {
  return (
    <main className="p-page">
      <div className="p-page__titulo">
        <h1 className="p-h1">El Padrón</h1>
        <span className="p-script">permisos, marchantes y giros</span>
      </div>
      <div className="p-card">
        <EstadoVacio titulo="Muy pronto" texto="Aquí irán los permisos, comerciantes y giros." />
      </div>
    </main>
  )
}
