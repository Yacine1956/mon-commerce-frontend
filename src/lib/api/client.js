import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
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

// Si le token est invalide/expiré, on déconnecte proprement
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mon_commerce_token')
      window.location.href = '/connexion'
    }
    return Promise.reject(error)
  }
)

export default apiClient