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
import beneficiaireService from '../services/beneficiaireService'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('getMyBeneficiaires', () => {
  test('retourne la liste', async () => {
    const beneficiaires = [{ id: 1, nom: 'Jean Dupont' }]
    ;(api.get as jest.Mock).mockResolvedValue({ data: beneficiaires })

    await expect(beneficiaireService.getMyBeneficiaires()).resolves.toEqual(beneficiaires)
  })

  test('gère la session expirée', async () => {
    ;(api.get as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(beneficiaireService.getMyBeneficiaires()).rejects.toThrow('Votre session a expiré')
  })

  test('remonte un message générique sur toute autre erreur', async () => {
    ;(api.get as jest.Mock).mockRejectedValue(new Error('boom'))
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(beneficiaireService.getMyBeneficiaires()).rejects.toThrow('Erreur lors de la récupération des bénéficiaires')
  })
})

describe('createBeneficiaire', () => {
  test('envoie nom et iban', async () => {
    ;(api.post as jest.Mock).mockResolvedValue({ data: { id: 1, nom: 'Jean Dupont' } })

    await beneficiaireService.createBeneficiaire('Jean Dupont', 'FR7630004028379876543210943')

    expect(api.post).toHaveBeenCalledWith('/beneficiaires/create', {
      nom: 'Jean Dupont',
      iban: 'FR7630004028379876543210943'
    })
  })

  test('donne un message explicite sur une erreur de format IBAN', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({
      response: { data: { errors: [{ field: 'iban', message: 'invalid' }] } }
    })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(beneficiaireService.createBeneficiaire('Jean', 'PAS-UN-IBAN')).rejects.toThrow("Format d'IBAN invalide")
  })

  test('donne un message explicite sur une erreur de nom', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({
      response: { data: { errors: [{ field: 'nom', message: 'invalid' }] } }
    })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(beneficiaireService.createBeneficiaire('J', 'FR7630004028379876543210943')).rejects.toThrow(
      'entre 2 et 100 caractères'
    )
  })

  test('retombe sur le message du backend si aucune erreur de validation typée', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({ response: { data: { message: 'Ce bénéficiaire existe déjà' } } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(beneficiaireService.createBeneficiaire('Jean', 'FR76...')).rejects.toThrow('Ce bénéficiaire existe déjà')
  })

  test('gère la session expirée', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(beneficiaireService.createBeneficiaire('Jean', 'FR76...')).rejects.toThrow('Votre session a expiré')
  })

  test('message par défaut si aucun champ ni message reconnu', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({})
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(beneficiaireService.createBeneficiaire('Jean', 'FR76...')).rejects.toThrow(
      'Erreur lors de la création du bénéficiaire'
    )
  })
})

describe('deleteBeneficiaire', () => {
  test('appelle le bon endpoint', async () => {
    ;(api.delete as jest.Mock).mockResolvedValue({})

    await beneficiaireService.deleteBeneficiaire(3)

    expect(api.delete).toHaveBeenCalledWith('/beneficiaires/3')
  })

  test('gère la session expirée', async () => {
    ;(api.delete as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(beneficiaireService.deleteBeneficiaire(3)).rejects.toThrow('Votre session a expiré')
  })

  test('message par défaut si le backend ne fournit rien', async () => {
    ;(api.delete as jest.Mock).mockRejectedValue({})
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(beneficiaireService.deleteBeneficiaire(3)).rejects.toThrow('Erreur lors de la suppression du bénéficiaire')
  })
})
