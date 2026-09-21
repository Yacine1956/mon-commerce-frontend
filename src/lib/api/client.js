import axios from 'axios'

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Ajoute automatiquement le token d'authentification à chaque requête
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mon_commerce_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Un 401 explicite (le serveur a répondu et a refusé le token) déconnecte
// réellement. L'absence de réponse (coupure réseau) ne déconnecte PAS —
// c'est géré séparément par authStore.verifierSession (mode offline).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mon_commerce_token')
      localStorage.removeItem('mon_commerce_user')
      localStorage.removeItem('mon_commerce_boutique')
      window.location.href = '/connexion'
    }

    return Promise.reject(error)
  }
)

export default apiClient