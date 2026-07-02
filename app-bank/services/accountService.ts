import api from './api'
import type { Account } from '../types/auth'
import sessionManager from '@/utils/sessionManager'

class AccountService {
  async getMyAccounts(): Promise<Account[]> {
    try {
      const response = await api.get('/accounts')
      return response.data
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error('Erreur lors de la récupération des comptes')
    }
  }

  async createAccountType(type: 'BANCAIRE' | 'EPARGNE' | 'POCKET') {
    try {
      const request = await api.post('/accounts/create', { type })
      return request.data
    } catch (error) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error('Erreur lors de la création du compte')
    }
  }
}

export default new AccountService()
