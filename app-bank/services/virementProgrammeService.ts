import api from './api'
import type { Frequence, VirementProgramme } from '../types/auth'
import sessionManager from '@/utils/sessionManager'

class VirementProgrammeService {
  async getMyVirementsProgrammes(): Promise<VirementProgramme[]> {
    try {
      const response = await api.get('/virements-programmes')
      return response.data
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error('Erreur lors de la récupération des virements programmés')
    }
  }

  async createVirementProgramme(
    compteSourceId: number,
    beneficiaireId: number,
    montant: number,
    libelle: string,
    frequence: Frequence,
    dateProchaineExecution: string,
    dateFin?: string | null
  ): Promise<VirementProgramme> {
    try {
      const response = await api.post('/virements-programmes/create', {
        compteSourceId,
        beneficiaireId,
        montant,
        libelle,
        frequence,
        dateProchaineExecution,
        dateFin
      })
      return response.data
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error(error.response?.data?.message ?? 'Erreur lors de la création du virement programmé')
    }
  }

  async annulerVirementProgramme(id: number): Promise<void> {
    try {
      await api.delete(`/virements-programmes/${id}`)
    } catch (error: any) {
      if (sessionManager.isSessionExpiredError(error)) {
        await sessionManager.handleSessionExpired()
        throw new Error('Votre session a expiré')
      }
      throw new Error(error.response?.data?.message ?? "Erreur lors de l'annulation du virement programmé")
    }
  }
}

export default new VirementProgrammeService()
