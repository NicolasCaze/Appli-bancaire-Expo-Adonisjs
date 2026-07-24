jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() }
}))

jest.mock('../utils/sessionManager', () => ({
  __esModule: true,
  default: { isSessionExpiredError: jest.fn(), handleSessionExpired: jest.fn() }
}))

import api from '../services/api'
import sessionManager from '../utils/sessionManager'
import virementProgrammeService from '../services/virementProgrammeService'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('getMyVirementsProgrammes', () => {
  test('retourne la liste', async () => {
    const virements = [{ id: 1, statut: 'ACTIF' }]
    ;(api.get as jest.Mock).mockResolvedValue({ data: virements })

    await expect(virementProgrammeService.getMyVirementsProgrammes()).resolves.toEqual(virements)
  })

  test('gère la session expirée', async () => {
    ;(api.get as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(virementProgrammeService.getMyVirementsProgrammes()).rejects.toThrow('Votre session a expiré')
  })

  test('remonte un message générique sur toute autre erreur', async () => {
    ;(api.get as jest.Mock).mockRejectedValue(new Error('boom'))
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(virementProgrammeService.getMyVirementsProgrammes()).rejects.toThrow(
      'Erreur lors de la récupération des virements programmés'
    )
  })
})

describe('createVirementProgramme', () => {
  test('envoie tous les paramètres, dateFin optionnelle', async () => {
    ;(api.post as jest.Mock).mockResolvedValue({ data: { id: 1 } })

    await virementProgrammeService.createVirementProgramme(1, 5, 100, 'Loyer', 'MENSUEL', '2026-08-01')

    expect(api.post).toHaveBeenCalledWith('/virements-programmes/create', {
      compteSourceId: 1,
      beneficiaireId: 5,
      montant: 100,
      libelle: 'Loyer',
      frequence: 'MENSUEL',
      dateProchaineExecution: '2026-08-01',
      dateFin: undefined
    })
  })

  test('remonte le message du backend en cas d\'erreur métier', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({ response: { data: { message: 'Bénéficiaire introuvable' } } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(
      virementProgrammeService.createVirementProgramme(1, 999, 100, 'x', 'UNIQUE', '2026-08-01')
    ).rejects.toThrow('Bénéficiaire introuvable')
  })

  test('gère la session expirée', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(
      virementProgrammeService.createVirementProgramme(1, 5, 100, 'x', 'UNIQUE', '2026-08-01')
    ).rejects.toThrow('Votre session a expiré')
  })
})

describe('annulerVirementProgramme', () => {
  test('appelle le bon endpoint', async () => {
    ;(api.delete as jest.Mock).mockResolvedValue({})

    await virementProgrammeService.annulerVirementProgramme(7)

    expect(api.delete).toHaveBeenCalledWith('/virements-programmes/7')
  })

  test('gère la session expirée', async () => {
    ;(api.delete as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(virementProgrammeService.annulerVirementProgramme(7)).rejects.toThrow('Votre session a expiré')
  })

  test('message par défaut si le backend ne fournit rien', async () => {
    ;(api.delete as jest.Mock).mockRejectedValue({})
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(virementProgrammeService.annulerVirementProgramme(7)).rejects.toThrow(
      "Erreur lors de l'annulation du virement programmé"
    )
  })
})
