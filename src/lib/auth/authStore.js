import { create } from 'zustand'
import apiClient from '../api/client'

const useAuthStore = create((set) => ({
  user: null,
  boutique: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (telephone, password) => {
    const response = await apiClient.post('/auth/login', { telephone, password })
    const { user, boutique, token } = response.data
    localStorage.setItem('mon_commerce_token', token)
    set({ user, boutique, isAuthenticated: true })
    return response.data
  },

  register: async (payload) => {
    const response = await apiClient.post('/auth/register', payload)
    const { user, boutique, token } = response.data
    localStorage.setItem('mon_commerce_token', token)
    set({ user, boutique, isAuthenticated: true })
    return response.data
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      localStorage.removeItem('mon_commerce_token')
      set({ user: null, boutique: null, isAuthenticated: false })
    }
  },

  // Appelé au chargement de l'app pour vérifier si le token stocké est encore valide
  verifierSession: async () => {
    const token = localStorage.getItem('mon_commerce_token')
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const response = await apiClient.get('/auth/me')
      set({ user: response.data.user, boutique: response.data.boutique, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('mon_commerce_token')
      set({ isAuthenticated: false, isLoading: false })
    }
  },
}))

export default useAuthStore