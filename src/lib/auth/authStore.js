import { create } from 'zustand'
import apiClient from '../api/client'

const CLE_USER = 'mon_commerce_user'
const CLE_BOUTIQUE = 'mon_commerce_boutique'

function sauvegarderSessionLocale(user, boutique) {
  localStorage.setItem(CLE_USER, JSON.stringify(user))
  localStorage.setItem(CLE_BOUTIQUE, JSON.stringify(boutique))
}

function effacerSessionLocale() {
  localStorage.removeItem(CLE_USER)
  localStorage.removeItem(CLE_BOUTIQUE)
}

const useAuthStore = create((set) => ({
  user: null,
  boutique: null,
  isAuthenticated: false,
  isLoading: true,
  sessionHorsLigne: false, // true si la session vient du cache local, pas confirmée par le serveur

  login: async (telephone, password) => {
    const response = await apiClient.post('/auth/login', { telephone, password })
    const { user, boutique, token } = response.data
    localStorage.setItem('mon_commerce_token', token)
    sauvegarderSessionLocale(user, boutique)
    set({ user, boutique, isAuthenticated: true, sessionHorsLigne: false })
    return response.data
  },

  register: async (payload) => {
    const response = await apiClient.post('/auth/register', payload)
    const { user, boutique, token } = response.data
    localStorage.setItem('mon_commerce_token', token)
    sauvegarderSessionLocale(user, boutique)
    set({ user, boutique, isAuthenticated: true, sessionHorsLigne: false })
    return response.data
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Si on est hors ligne, la déconnexion serveur échoue — pas grave,
      // on efface quand même la session locale, l'essentiel est fait.
    } finally {
      localStorage.removeItem('mon_commerce_token')
      effacerSessionLocale()
      set({ user: null, boutique: null, isAuthenticated: false, sessionHorsLigne: false })
    }
  },

  /**
   * Appelée au chargement de l'app. Si aucune connexion n'est disponible,
   * on fait confiance au token + aux données utilisateur déjà en cache
   * plutôt que de déconnecter le commerçant — la vraie vérification
   * (token révoqué, compte désactivé...) se refera dès que le réseau revient.
   */
  verifierSession: async () => {
    const token = localStorage.getItem('mon_commerce_token')
    if (!token) {
      set({ isLoading: false })
      return
    }

    try {
      const response = await apiClient.get('/auth/me')
      sauvegarderSessionLocale(response.data.user, response.data.boutique)
      set({
        user: response.data.user,
        boutique: response.data.boutique,
        isAuthenticated: true,
        isLoading: false,
        sessionHorsLigne: false,
      })
    } catch (err) {
      // Pas de réponse du serveur = coupure réseau : on retombe sur le
      // cache local plutôt que de déconnecter le commerçant.
      if (!err.response) {
        const userCache = localStorage.getItem(CLE_USER)
        const boutiqueCache = localStorage.getItem(CLE_BOUTIQUE)

        if (userCache && boutiqueCache) {
          set({
            user: JSON.parse(userCache),
            boutique: JSON.parse(boutiqueCache),
            isAuthenticated: true,
            isLoading: false,
            sessionHorsLigne: true,
          })
          return
        }
      }

      // Le serveur a répondu explicitement (401, compte désactivé...) :
      // là on déconnecte vraiment.
      localStorage.removeItem('mon_commerce_token')
      effacerSessionLocale()
      set({ isAuthenticated: false, isLoading: false, sessionHorsLigne: false })
    }
  },
}))

export default useAuthStore