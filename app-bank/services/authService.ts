import api from './api'
import SecureStorage from './secureStorage'
import type { User, LoginResponse, LogoutResponse } from '../types/auth'

/**
 * Service d'authentification
 * Gère la communication avec le backend pour login et logout.
 * Le refresh automatique du token est géré par l'intercepteur dans api.ts
 */
class AuthService {
  /**
   * Se connecter avec email et password
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @returns L'utilisateur connecté
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post<{ message: string; data: LoginResponse }>('/auth/login', {
        email,
        password,
        deviceInfo: 'mobile-app'
      })

      // Le backend renvoie {message, data: {user, tokens}}
      const { user, tokens } = response.data.data

      await SecureStorage.saveTokens(tokens.accessToken, tokens.refreshToken)
      await SecureStorage.saveUser(user)
      return user
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Email ou mot de passe incorrect')
      }
      throw new Error('Erreur de connexion au serveur')
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
        await api.post<LogoutResponse>('/auth/logout', { refreshToken })
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
}

export default new AuthService()
