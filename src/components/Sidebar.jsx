import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Truck,
  Receipt,
  FileText,
  Sparkles,
  Settings,
  ChevronRight,
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
  LogOut,
  X,
} from 'lucide-react'
import useOfflineStore from '../lib/offline/offlineStore'
import { synchroniser } from '../lib/offline/syncManager'
import useThemeStore from '../lib/theme/themeStore'
import useAuthStore from '../lib/auth/authStore'

const liens = [
  { to: '/', label: 'Dashboard', icone: LayoutDashboard, fin: true },
  { to: '/ventes', label: 'Ventes', icone: ShoppingCart },
  { to: '/produits', label: 'Produits', icone: Package },
  { to: '/stock', label: 'Stock', icone: Boxes },
  { to: '/clients', label: 'Clients', icone: Users },
  { to: '/fournisseurs', label: 'Fournisseurs', icone: Truck },
  { to: '/depenses', label: 'Dépenses', icone: Receipt },
  { to: '/rapports', label: 'Rapports', icone: FileText },
  { to: '/assistant', label: 'Assistant IA', icone: Sparkles },
  { to: '/parametres', label: 'Paramètres', icone: Settings },
]

export default function Sidebar({ ouverte, onFermer }) {
  const { estEnLigne, ventesEnAttente, depensesEnAttente, synchronisationEnCours } = useOfflineStore()
  const { theme, toggleTheme } = useThemeStore()
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const totalEnAttente = ventesEnAttente + depensesEnAttente

  async function handleLogout() {
    await logout()
    navigate('/connexion')
  }

  return (
    <>
      {/* Fond sombre derrière le panneau, uniquement sur mobile quand ouvert */}
      {ouverte && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onFermer}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen flex flex-col shrink-0 transform transition-transform duration-200 ease-out
          lg:relative lg:translate-x-0
          ${ouverte ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #1C2A45 0%, #0A1120 100%)' }}
      >
        {/* En-tête avec logo */}
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #172554, #101828)' }}
            >
              SN
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-white text-base leading-tight truncate">
                SenNoflaye
              </h1>
              <p className="text-white/45 text-xs">Gestion boutique</p>
            </div>
          </div>

          {/* Bouton fermer, uniquement sur mobile */}
          <button onClick={onFermer} className="lg:hidden text-white/60 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-5 pt-2 pb-1">
          <p className="text-white/35 text-[11px] font-semibold tracking-widest uppercase">
            Menu principal
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {liens.map(({ to, label, icone: Icone, fin }) => (
            <NavLink
              key={to}
              to={to}
              end={fin}
              onClick={onFermer}
              className={({ isActive }) =>
                `group flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-xl text-sm font-medium transition relative ${
                  isActive ? 'text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full"
                      style={{ background: 'linear-gradient(180deg, #C9A96E, #9A8050)' }}
                    />
                  )}
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition"
                    style={
                      isActive
                        ? { background: 'linear-gradient(135deg, #C9A96E, #9A8050)' }
                        : { background: 'rgba(255,255,255,0.06)' }
                    }
                  >
                    <Icone size={16} strokeWidth={2} className={isActive ? 'text-white' : 'text-white/60'} />
                  </span>
                  <span className="flex-1 truncate">{label}</span>
                  {isActive && <ChevronRight size={16} className="text-white/40" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Statut réseau / synchronisation */}
        {(!estEnLigne || totalEnAttente > 0) && (
          <div className="mx-3 mb-2 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              {!estEnLigne ? (
                <>
                  <WifiOff size={14} className="text-accent-400" />
                  <span className="text-white text-xs font-medium">Hors ligne</span>
                </>
              ) : (
                <>
                  <RefreshCw size={14} className={`text-accent-400 ${synchronisationEnCours ? 'animate-spin' : ''}`} />
                  <span className="text-white text-xs font-medium">
                    {synchronisationEnCours ? 'Synchronisation...' : 'En attente de synchro'}
                  </span>
                </>
              )}
            </div>
            {totalEnAttente > 0 && (
              <p className="text-white/50 text-xs">
                {totalEnAttente} élément(s) à synchroniser
              </p>
            )}
            {estEnLigne && totalEnAttente > 0 && !synchronisationEnCours && (
              <button
                onClick={() => synchroniser()}
                className="text-accent-400 text-xs font-medium mt-1.5 hover:underline"
              >
                Synchroniser maintenant
              </button>
            )}
          </div>
        )}

        {/* Bascule clair / sombre */}
        <div className="mx-3 mb-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          </button>
        </div>

        {/* Déconnexion */}
        <div className="mx-3 mb-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>

        {/* Carte abonnement */}
        <div className="mx-3 mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/40 text-xs mb-0.5">Abonnement</p>
          <div className="flex items-center justify-between">
            <p className="text-white text-sm font-semibold">Version gratuite</p>
            <span className="w-2 h-2 rounded-full bg-positive shrink-0" />
          </div>
        </div>
      </aside>
    </>
  )
}