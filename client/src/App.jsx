import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { NoticeProvider } from './context/NoticeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import AccessPage from './pages/AccessPage'
import MapPage from './pages/MapPage'
import RegistryPage from './pages/RegistryPage'

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
                <Route path="/" element={<MapPage />} />
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
