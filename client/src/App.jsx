import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { NoticeProvider } from './context/NoticeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import { IcoSpin } from './components/ui/icons'
import AccessPage from './pages/AccessPage'
import RegistryPage from './pages/RegistryPage'

// Leaflet y Geoman pesan bastante: se descargan solo al abrir el mapa
const MapPage = lazy(() => import('./pages/MapPage'))

export default function App() {
  return (
    // NoticeProvider va por fuera para que AuthProvider también pueda mostrar avisos
    <NoticeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/acceso" element={<AccessPage />} />

            {/* Todo lo de adentro exige sesión */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={
                  <Suspense fallback={
                    <div className="p-root p-cargando" role="status">
                      <IcoSpin size={28} /> Cargando mapa…
                    </div>
                  }>
                    <MapPage />
                  </Suspense>
                } />
                <Route path="/padron" element={<RegistryPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NoticeProvider>
  )
}
