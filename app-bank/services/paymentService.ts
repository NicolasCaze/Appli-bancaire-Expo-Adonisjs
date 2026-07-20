import api from './api'
import type { Payment, BudgetCategorie } from '../types/auth'
import sessionManager from '@/utils/sessionManager'

class PaymentService {
  async getMyPayments(): Promise<Payment[]> {
    try {
      const response = await api.get('/payments')
      return response.data
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error('Erreur lors de la récupération des paiements')
    }
  }

  async getBudgetStatut(): Promise<BudgetCategorie[]> {
    try {
      const response = await api.get('/payments/budget')
      return response.data
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error('Erreur lors de la récupération du budget')
    }
  }
}

export default new PaymentService()
