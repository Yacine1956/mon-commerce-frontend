import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [sidebarOuverte, setSidebarOuverte] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar ouverte={sidebarOuverte} onFermer={() => setSidebarOuverte(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Barre mobile avec bouton menu — visible uniquement en dessous du breakpoint lg */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-black/5 bg-surface shrink-0">
          <button
            onClick={() => setSidebarOuverte(true)}
            className="text-ink p-1 -ml-1"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-display font-semibold text-ink">SenNoflaye</span>
        </div>

        <main className="flex-1 overflow-y-auto bg-paper">{children}</main>
      </div>
    </div>
  )
}