import api from './api'
import type { Transaction } from '../types/auth'
import sessionManager from '@/utils/sessionManager'

class TransactionService {
  async getMyTransactions(): Promise<Transaction[]> {
    try {
      const response = await api.get('/transactions')
      return response.data
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error('Erreur lors de la récupération des transactions')
    }
  }

  async createInternalTransfer(compteSourceId: number, compteDestinationId: number, montant: number, libelle: string): Promise<Transaction> {
    try {
      const response = await api.post('/transactions/create', {
        compteSourceId,
        compteDestinationId,
        montant,
        libelle
      })
      return response.data
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error(error.response?.data?.message ?? 'Erreur lors de la création du virement')
    }
  }

  async createVirementBeneficiaire(compteSourceId: number, beneficiaireId: number, montant: number, libelle: string): Promise<Transaction> {
    try {
      const response = await api.post('/transactions/create-beneficiaire', {
        compteSourceId,
        beneficiaireId,
        montant,
        libelle
      })
      return response.data
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error(error.response?.data?.message ?? 'Erreur lors de la création du virement')
    }
  }
}

export default new TransactionService()
