jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    clearTokens: jest.fn(),
    deleteUser: jest.fn()
  }
}))
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }))

import secureStorage from '../services/secureStorage'
import { router } from 'expo-router'
import sessionManager from '../utils/sessionManager'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('isSessionExpiredError', () => {
  test('détecte une erreur HTTP 401', () => {
    expect(sessionManager.isSessionExpiredError({ response: { status: 401 } })).toBe(true)
  })

  test('détecte un message "Session expirée"', () => {
    expect(sessionManager.isSessionExpiredError({ message: 'Session expirée, reconnectez-vous' })).toBe(true)
  })

  test('détecte un message contenant "refresh token"', () => {
    expect(sessionManager.isSessionExpiredError({ message: 'Aucun refresh token disponible' })).toBe(true)
  })

  test('retourne une valeur falsy pour une erreur non liée à la session', () => {
    expect(sessionManager.isSessionExpiredError({ response: { status: 500 } })).toBeFalsy()
    expect(sessionManager.isSessionExpiredError({ message: 'Erreur réseau' })).toBeFalsy()
  })

  test('retourne une valeur falsy pour une erreur sans response ni message', () => {
    expect(sessionManager.isSessionExpiredError({})).toBeFalsy()
  })
})

describe('handleSessionExpired', () => {
  test('nettoie les tokens/user et redirige vers le login', async () => {
    await sessionManager.handleSessionExpired()

    expect(secureStorage.clearTokens).toHaveBeenCalled()
    expect(secureStorage.deleteUser).toHaveBeenCalled()
    expect(router.replace).toHaveBeenCalledWith('/(auth)/login')
  })
})
