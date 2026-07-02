import secureStorage from '@/services/secureStorage'
import { router } from 'expo-router'

class SessionManager {
  async handleSessionExpired(): Promise<void> {
    await secureStorage.clearTokens()
    await secureStorage.deleteUser()
    router.replace('/(auth)/login')
  }

  isSessionExpiredError(error: any): boolean {
    return error.response?.status === 401 || 
           error.message?.includes('Session expirée') ||
           error.message?.includes('refresh token')
  }
}

export default new SessionManager()
