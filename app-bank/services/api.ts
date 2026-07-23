import axios, { AxiosInstance } from 'axios'
import SecureStorage from './secureStorage'
import sessionManager from '@/utils/sessionManager'
import type { RefreshResponse } from '@/types/auth'

/**
 * Instance Axios partagée par tous les services.
 * Centralise l'URL de base, l'injection du token et le refresh automatique
 * pour éviter d'avoir à dupliquer cette logique dans chaque service.
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.64:3333'

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = await SecureStorage.getRefreshToken()
        if (!refreshToken) {
          throw new Error('Aucun refresh token disponible')
        }

        // Appel direct via axios (pas via `api`) pour éviter de re-déclencher l'intercepteur
        const refreshResponse = await axios.post<{ message: string; data: RefreshResponse }>(`${API_URL}/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data
        await SecureStorage.saveTokens(accessToken, newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api.request(originalRequest)
      } catch (refreshError) {
        await sessionManager.handleSessionExpired()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
