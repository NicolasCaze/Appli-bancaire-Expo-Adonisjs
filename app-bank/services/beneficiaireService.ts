import api from './api'
import type { Beneficiaire } from '../types/auth'
import sessionManager from '@/utils/sessionManager'

class BeneficiaireService {
  async getMyBeneficiaires(): Promise<Beneficiaire[]> {
    try {
      const response = await api.get('/beneficiaires')
      return response.data
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error('Erreur lors de la récupération des bénéficiaires')
    }
  }

  async createBeneficiaire(nom: string, iban: string): Promise<Beneficiaire> {
    try {
      const response = await api.post('/beneficiaires/create', { nom, iban })
      return response.data
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      const validationErrors = error.response?.data?.errors
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        const field = validationErrors[0].field
        if (field === 'iban') {
          throw new Error("Format d'IBAN invalide. Vérifiez qu'il ne contient pas d'espaces ni de caractères incorrects.")
        }
        if (field === 'nom') {
          throw new Error('Le nom du bénéficiaire doit contenir entre 2 et 100 caractères.')
        }
      }
      throw new Error(error.response?.data?.message ?? "Erreur lors de la création du bénéficiaire")
    }
  }

  async deleteBeneficiaire(id: number): Promise<void> {
    try {
      await api.delete(`/beneficiaires/${id}`)
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error(error.response?.data?.message ?? 'Erreur lors de la suppression du bénéficiaire')
    }
  }
}

export default new BeneficiaireService()
