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
import accountService from '../services/accountService'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('getMyAccounts', () => {
  test('retourne les comptes', async () => {
    const accounts = [{ id: 1, type: 'BANCAIRE', solde: 100 }]
    ;(api.get as jest.Mock).mockResolvedValue({ data: accounts })

    await expect(accountService.getMyAccounts()).resolves.toEqual(accounts)
    expect(api.get).toHaveBeenCalledWith('/accounts')
  })

  test('gère la session expirée', async () => {
    ;(api.get as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(accountService.getMyAccounts()).rejects.toThrow('Votre session a expiré')
    expect(sessionManager.handleSessionExpired).toHaveBeenCalled()
  })

  test('remonte un message générique sur toute autre erreur', async () => {
    ;(api.get as jest.Mock).mockRejectedValue(new Error('boom'))
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(accountService.getMyAccounts()).rejects.toThrow('Erreur lors de la récupération des comptes')
  })
})

describe('createAccountType', () => {
  test('crée un compte du type demandé', async () => {
    ;(api.post as jest.Mock).mockResolvedValue({ data: { id: 2, type: 'EPARGNE' } })

    const result = await accountService.createAccountType('EPARGNE')

    expect(api.post).toHaveBeenCalledWith('/accounts/create', { type: 'EPARGNE' })
    expect(result).toEqual({ id: 2, type: 'EPARGNE' })
  })

  test('gère la session expirée', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(accountService.createAccountType('POCKET')).rejects.toThrow('Votre session a expiré')
  })

  test('remonte un message générique sur toute autre erreur', async () => {
    ;(api.post as jest.Mock).mockRejectedValue(new Error('boom'))
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(accountService.createAccountType('BANCAIRE')).rejects.toThrow('Erreur lors de la création du compte')
  })
})
