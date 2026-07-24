jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() }
}))

jest.mock('../utils/sessionManager', () => ({
  __esModule: true,
  default: { isSessionExpiredError: jest.fn(), handleSessionExpired: jest.fn() }
}))

import api from '../services/api'
import sessionManager from '../utils/sessionManager'
import paymentService from '../services/paymentService'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('getMyPayments', () => {
  test('retourne les paiements', async () => {
    const payments = [{ id: 1, montant: 42 }]
    ;(api.get as jest.Mock).mockResolvedValue({ data: payments })

    await expect(paymentService.getMyPayments()).resolves.toEqual(payments)
    expect(api.get).toHaveBeenCalledWith('/payments')
  })

  test('gère la session expirée', async () => {
    ;(api.get as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(paymentService.getMyPayments()).rejects.toThrow('Votre session a expiré')
    expect(sessionManager.handleSessionExpired).toHaveBeenCalled()
  })

  test('remonte un message générique sur toute autre erreur', async () => {
    ;(api.get as jest.Mock).mockRejectedValue(new Error('boom'))
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(paymentService.getMyPayments()).rejects.toThrow('Erreur lors de la récupération des paiements')
  })
})
