import { User } from '@/types/auth'
import * as SecureStore from 'expo-secure-store'

/**
 * Service de stockage sécurisé pour les tokens et préférences
 * Utilise expo-secure-store qui chiffre automatiquement les données
 * - iOS : Keychain (chiffrement matériel)
 * - Android : EncryptedSharedPreferences (AES)
 */

// Clés de stockage
const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  USER_EMAIL: 'user_email',
  USER_PASSWORD: 'user_password',
  USER: 'user'
}

class SecureStorage {
  /**
   * Sauvegarder les tokens (access + refresh)
   * @param accessToken - JWT pour authentifier les requêtes API
   * @param refreshToken - Token pour renouveler l'access token
   */
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken)
      await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des tokens:', error)
      throw new Error('Impossible de sauvegarder les tokens')
    }
  }

  /**
   * Récupérer l'access token
   * @returns L'access token ou null s'il n'existe pas
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN)  
      return token
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'access token:', error)
      return null
    }
  }

  /**
   * Récupérer le refresh token
   * @returns Le refresh token ou null s'il n'existe pas
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN)
      return token
    } catch (error) {
      console.error('Erreur lors de la récupération du refresh token:', error)
      return null
    }
  }

  /**
   * Supprimer tous les tokens (logout)
   */
  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN)
      await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN)
    } catch (error) {
      console.error('Erreur lors de la suppression des tokens:', error)
      throw new Error('Impossible de supprimer les tokens')
    }
  }

  /**
   * Sauvegarder la préférence Face ID
   * @param enabled - true si Face ID activé, false sinon
   */
  async saveBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.BIOMETRIC_ENABLED, enabled.toString())
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la préférence Face ID:', error)
      throw new Error('Impossible de sauvegarder la préférence Face ID')
    }
  }

  /**
   * Vérifier si Face ID est activé
   * @returns true si Face ID activé, false sinon
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(KEYS.BIOMETRIC_ENABLED)
      return value === 'true'
    } catch (error) {
      console.error('Erreur lors de la récupération de la préférence Face ID:', error)
      return false
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté (a des tokens)
   * @returns true si des tokens existent, false sinon
   */
  async hasTokens(): Promise<boolean> {
    const token = await this.getAccessToken()
    return token !== null
  }

  /**
   * Sauvegarder les credentials pour le login Face ID
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe de l'utilisateur
   */
  async saveCredentials(email: string, password: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.USER_EMAIL, email)
      await SecureStore.setItemAsync(KEYS.USER_PASSWORD, password)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des credentials:', error)
      throw new Error('Impossible de sauvegarder les credentials')
    }
  }

  /**
   * Récupérer les credentials sauvegardés
   * @returns {email, password} ou null si non sauvegardés
   */
  async getCredentials(): Promise<{ email: string; password: string } | null> {
    try {
      const email = await SecureStore.getItemAsync(KEYS.USER_EMAIL)
      const password = await SecureStore.getItemAsync(KEYS.USER_PASSWORD)
      
      if (email && password) {
        return { email, password }
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération des credentials:', error)
      return null
    }
  }

  /**
   * Supprimer les credentials sauvegardés
   */
  async deleteCredentials(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(KEYS.USER_EMAIL)
      await SecureStore.deleteItemAsync(KEYS.USER_PASSWORD)
    } catch (error) {
      console.error('Erreur lors de la suppression des credentials:', error)
    }
  }

 async saveUser(user: User){
      try {
        const userString = JSON.stringify(user)
        await SecureStore.setItemAsync(KEYS.USER, userString)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du user:', error)
        throw new Error('Impossible de sauvegarder le user')
      }
 }

 async getUser(): Promise<User | null>{
  try {
      const savedString = await SecureStore.getItemAsync(KEYS.USER)
      if(savedString){
        console.log(savedString)
        return JSON.parse(savedString)
        
      }
      return null
  } catch (error) {
    console.error('Erreur lors de la récupération du user:', error)
    throw new Error('Impossible de récupérer le user')
  }
 }

 async deleteUser(): Promise<void>{
  try {
    await SecureStore.deleteItemAsync(KEYS.USER)
    console.log('User supprimé')
  } catch (error) {
    console.log('Erreur lors de la suppression du user:', error)
    throw new Error('Impossible de supprimer le user')
  }
 }
}

// Exporter une instance unique (singleton)
export default new SecureStorage()
