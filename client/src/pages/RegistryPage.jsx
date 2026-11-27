import { useState } from 'react'
import { Pestanas } from '../components/ui/ui'
import PermitsTab from '../components/registry/PermitsTab'
import VendorsTab from '../components/registry/VendorsTab'
import CategoriesTab from '../components/registry/CategoriesTab'

const TABS = { Permisos: PermitsTab, Comerciantes: VendorsTab, Giros: CategoriesTab }

// Padrón: CRUD de permisos, comerciantes y giros en pestañas.
export default function RegistryPage() {
  const [tab, setTab] = useState('Permisos')
  const ActiveTab = TABS[tab]

  return (
    <main className="p-page">
      <div className="p-page__titulo">
        <h1 className="p-h1">El Padrón</h1>
        <span className="p-script">permisos, marchantes y giros</span>
      </div>

      <Pestanas etiqueta="Padrón" items={Object.keys(TABS)} activa={tab} onCambio={setTab} />
      <div className="p-card p-padron" role="tabpanel" aria-label={tab}>
        <ActiveTab />
      </div>
    </main>
  )
}
