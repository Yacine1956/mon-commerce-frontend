import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './lib/auth/authStore'
import LoginPage from './features/auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPage'
import Layout from './components/Layout'
import PageAVenir from './components/PageAVenir'
import ProduitsPage from './features/produits/ProduitsPage'
import VentePage from './features/ventes/VentePage'
import VentesHistoriquePage from './features/ventes/VentesHistoriquePage'
import DepensesPage from './features/depenses/DepensesPage'
import { initialiserSynchronisation } from './lib/offline/syncManager'
import RegisterPage from './features/auth/RegisterPage'
import useThemeStore from './lib/theme/themeStore'
import RapportsPage from './features/rapports/RapportsPage'
import ParametresPage from './features/parametres/ParametresPage'
import StockPage from './features/stock/StockPage'

function RouteProtegee({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>
  }
  if (!isAuthenticated) return <Navigate to="/connexion" replace />

  return <Layout>{children}</Layout>
}

export default function App() {
  const verifierSession = useAuthStore((state) => state.verifierSession)

  useEffect(() => {
    verifierSession()
  }, [verifierSession])

  useEffect(() => {
    initialiserSynchronisation()
  }, [])

  const initTheme = useThemeStore((state) => state.initTheme)
  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />

        <Route path="/" element={<RouteProtegee><DashboardPage /></RouteProtegee>} />
        <Route path="/ventes" element={<RouteProtegee><VentePage /></RouteProtegee>} />
        <Route path="/ventes/historique" element={<RouteProtegee><VentesHistoriquePage /></RouteProtegee>} />
        <Route path="/produits" element={<RouteProtegee><ProduitsPage /></RouteProtegee>} />
        <Route path="/stock" element={<RouteProtegee><StockPage /></RouteProtegee>} />
        <Route path="/clients" element={<RouteProtegee><PageAVenir titre="Clients" /></RouteProtegee>} />
        <Route path="/fournisseurs" element={<RouteProtegee><PageAVenir titre="Fournisseurs" /></RouteProtegee>} />
        <Route path="/depenses" element={<RouteProtegee><DepensesPage /></RouteProtegee>} />
        <Route path="/rapports" element={<RouteProtegee><RapportsPage /></RouteProtegee>} />
        <Route path="/assistant" element={<RouteProtegee><PageAVenir titre="Assistant IA" /></RouteProtegee>} />
        <Route path="/parametres" element={<RouteProtegee><ParametresPage /></RouteProtegee>} />
      </Routes>
    </BrowserRouter>
  )
}