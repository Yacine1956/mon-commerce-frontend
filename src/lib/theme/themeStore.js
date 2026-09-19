import { create } from 'zustand'

const CLE_STOCKAGE = 'mon_commerce_theme'

function appliquerTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(CLE_STOCKAGE, theme)
}

const useThemeStore = create((set, get) => ({
  theme: 'light',

  initTheme: () => {
    const enregistre = localStorage.getItem(CLE_STOCKAGE)
    const prefereSombre = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    const theme = enregistre || (prefereSombre ? 'dark' : 'light')
    appliquerTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    const nouveau = get().theme === 'light' ? 'dark' : 'light'
    appliquerTheme(nouveau)
    set({ theme: nouveau })
  },
}))

export default useThemeStore