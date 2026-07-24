jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() }
}))

jest.mock('../utils/sessionManager', () => ({
  __esModule: true,
  default: { isSessionExpiredError: jest.fn(), handleSessionExpired: jest.fn() }
}))

import api from '../services/api'
import sessionManager from '../utils/sessionManager'
import transactionService from '../services/transactionService'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('getMyTransactions', () => {
  test('retourne les transactions', async () => {
    const transactions = [{ id: 1, montant: 50 }]
    ;(api.get as jest.Mock).mockResolvedValue({ data: transactions })

    await expect(transactionService.getMyTransactions()).resolves.toEqual(transactions)
  })

  test('gère la session expirée', async () => {
    ;(api.get as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(transactionService.getMyTransactions()).rejects.toThrow('Votre session a expiré')
  })

  test('remonte un message générique sur toute autre erreur', async () => {
    ;(api.get as jest.Mock).mockRejectedValue(new Error('boom'))
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(transactionService.getMyTransactions()).rejects.toThrow('Erreur lors de la récupération des transactions')
  })
})

describe('createInternalTransfer', () => {
  test('envoie les bons paramètres', async () => {
    ;(api.post as jest.Mock).mockResolvedValue({ data: { id: 1 } })

    await transactionService.createInternalTransfer(1, 2, 100, 'Virement')

    expect(api.post).toHaveBeenCalledWith('/transactions/create', {
      compteSourceId: 1,
      compteDestinationId: 2,
      montant: 100,
      libelle: 'Virement'
    })
  })

  test('remonte le message du backend en cas d\'erreur métier', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({ response: { data: { message: 'Solde insuffisant' } } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(transactionService.createInternalTransfer(1, 2, 999, 'x')).rejects.toThrow('Solde insuffisant')
  })

  test('gère la session expirée', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(transactionService.createInternalTransfer(1, 2, 100, 'x')).rejects.toThrow('Votre session a expiré')
  })
})

describe('createVirementBeneficiaire', () => {
  test('envoie les bons paramètres', async () => {
    ;(api.post as jest.Mock).mockResolvedValue({ data: { id: 2 } })

    await transactionService.createVirementBeneficiaire(1, 5, 100, 'Virement ext')

    expect(api.post).toHaveBeenCalledWith('/transactions/create-beneficiaire', {
      compteSourceId: 1,
      beneficiaireId: 5,
      montant: 100,
      libelle: 'Virement ext'
    })
  })

  test('gère la session expirée', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(transactionService.createVirementBeneficiaire(1, 5, 100, 'x')).rejects.toThrow('Votre session a expiré')
  })

  test('message par défaut si le backend ne fournit rien', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({})
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(transactionService.createVirementBeneficiaire(1, 5, 100, 'x')).rejects.toThrow('Erreur lors de la création du virement')
  })
})
