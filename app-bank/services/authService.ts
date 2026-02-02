import axios, { AxiosInstance } from 'axios'
import SecureStorage from './secureStorage'
import type { User, LoginResponse, RefreshResponse, LogoutResponse } from '../types/auth'

/**
 * Service d'authentification
 * Gère la communication avec le backend pour login, refresh, logout
 */

const API_URL = 'http://192.168.1.64:3333'

class AuthService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })

    this.setupInterceptors()
  }

  /**
   * Configuration des intercepteurs Axios
   * Gère l'auto-refresh quand l'access token expire
   */
  private setupInterceptors(): void {
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            await this.refresh()
            const newAccessToken = await SecureStorage.getAccessToken()
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
            return this.api.request(originalRequest)
          } catch (refreshError) {
            await SecureStorage.clearTokens()
            throw refreshError
          }
        }

        throw error
      }
    )
  }

  /**
   * Se connecter avec email et password
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @returns L'utilisateur connecté
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await this.api.post<LoginResponse>('/auth/login', {
        email,
        password,
        deviceInfo: 'mobile-app'
      })
      
      // Le backend renvoie {message, data: {user, tokens}}
      const { user, tokens } = response.data.data
      await SecureStorage.saveTokens(tokens.accessToken, tokens.refreshToken)
      await SecureStorage.saveUser(user)
      console.log(user)
      return user
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Email ou mot de passe incorrect')
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  /**
   * Renouveler l'access token avec le refresh token
   * Rotation automatique : l'ancien refresh token est révoqué
   */
  async refresh(): Promise<void> {
    try {
      const refreshToken = await SecureStorage.getRefreshToken()

      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible')
      }

      const response = await this.api.post<RefreshResponse>('/auth/refresh', {
        refreshToken
      })
      
      const { accessToken, refreshToken: newRefreshToken } = response.data
      await SecureStorage.saveTokens(accessToken, newRefreshToken)
    } catch (error) {
      await SecureStorage.clearTokens()
      throw new Error('Session expirée, veuillez vous reconnecter')
    }
  }

  /**
   * Se déconnecter
   * Révoque le refresh token côté serveur et supprime les tokens localement
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await SecureStorage.getRefreshToken()

      if (refreshToken) {
        await this.api.post<LogoutResponse>('/auth/logout', { refreshToken })
      }

      await SecureStorage.clearTokens()
      await SecureStorage.deleteUser()
    } catch (error) {
      await SecureStorage.clearTokens()
      throw new Error('Erreur lors de la déconnexion')
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   * @returns true si des tokens existent, false sinon
   */
  async isAuthenticated(): Promise<boolean> {
    return await SecureStorage.hasTokens()
  }

  /**
   * Récupérer l'utilisateur actuellement connecté
   * Décode le JWT pour extraire les infos (sans vérifier la signature)
   * @returns L'utilisateur ou null si non connecté
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const accessToken = await SecureStorage.getAccessToken()

      if (!accessToken) {
        return null
      }

      const payload = JSON.parse(atob(accessToken.split('.')[1]))

      return {
        id: payload.userId,
        email: payload.email,
        firstname: '',
        lastname: ''
      }
    } catch (error) {
      return null
    }
  }
}

export default new AuthService()
