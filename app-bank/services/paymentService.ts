import api from './api'
import type { Payment } from '../types/auth'
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
}

export default new PaymentService()
