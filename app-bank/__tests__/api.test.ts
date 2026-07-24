// Le mock est entièrement autonome (aucune référence à une variable externe) pour éviter
// tout problème d'ordre d'exécution avec le hoisting de jest.mock()/import.
jest.mock('axios', () => {
  const mockInstance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    request: jest.fn()
  }
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockInstance),
      post: jest.fn()
    }
  }
})

jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    saveTokens: jest.fn()
  }
}))

jest.mock('../utils/sessionManager', () => ({
  __esModule: true,
  default: {
    handleSessionExpired: jest.fn()
  }
}))

import axios from 'axios'
import secureStorage from '../services/secureStorage'
import sessionManager from '../utils/sessionManager'
// L'import déclenche axios.create() + l'enregistrement des intercepteurs sur mockAxiosInstance
import '../services/api'

// Instance renvoyée par axios.create(), récupérée après coup (pas de référence externe requise à la construction)
const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0].value

// Capturés une seule fois, juste après l'import ci-dessus : clearAllMocks() dans beforeEach
// effacerait mock.calls sur interceptors.request.use / response.use sinon.
const requestInterceptorFn = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
const successHandlerFn = mockAxiosInstance.interceptors.response.use.mock.calls[0][0]
const errorHandlerFn = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]

beforeEach(() => {
  jest.clearAllMocks()
})

describe('intercepteur de requête', () => {
  test('ajoute le header Authorization si un access token existe', async () => {
    ;(secureStorage.getAccessToken as jest.Mock).mockResolvedValue('token-123')

    const config = await requestInterceptorFn({ headers: {} })

    expect(config.headers.Authorization).toBe('Bearer token-123')
  })

  test("n'ajoute pas de header Authorization si aucun token", async () => {
    ;(secureStorage.getAccessToken as jest.Mock).mockResolvedValue(null)

    const config = await requestInterceptorFn({ headers: {} })

    expect(config.headers.Authorization).toBeUndefined()
  })
})

describe('intercepteur de réponse — refresh automatique sur 401', () => {
  test('laisse passer une réponse réussie telle quelle', () => {
    const response = { data: 'ok' }
    expect(successHandlerFn(response)).toBe(response)
  })

  test('rejette directement une erreur non-401', async () => {
    const error = { response: { status: 500 }, config: {} }
    await expect(errorHandlerFn(error)).rejects.toBe(error)
    expect(axios.post).not.toHaveBeenCalled()
  })

  test('rafraîchit le token et rejoue la requête originale sur un 401', async () => {
    ;(secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-abc')
    ;(axios.post as jest.Mock).mockResolvedValue({
      data: { data: { accessToken: 'new-access', refreshToken: 'new-refresh' } }
    })
    mockAxiosInstance.request.mockResolvedValue({ data: 'retried' })

    const originalRequest: any = { headers: {}, _retry: undefined }
    const error = { response: { status: 401 }, config: originalRequest }

    const result = await errorHandlerFn(error)

    expect(secureStorage.saveTokens).toHaveBeenCalledWith('new-access', 'new-refresh')
    expect(originalRequest.headers.Authorization).toBe('Bearer new-access')
    expect(originalRequest._retry).toBe(true)
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(originalRequest)
    expect(result).toEqual({ data: 'retried' })
  })

  test("déclenche la déconnexion si aucun refresh token n'est disponible", async () => {
    ;(secureStorage.getRefreshToken as jest.Mock).mockResolvedValue(null)

    const error = { response: { status: 401 }, config: {} }

    await expect(errorHandlerFn(error)).rejects.toThrow()
    expect(sessionManager.handleSessionExpired).toHaveBeenCalled()
  })

  test('déclenche la déconnexion si le refresh échoue côté serveur', async () => {
    ;(secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-abc')
    ;(axios.post as jest.Mock).mockRejectedValue(new Error('refresh token invalide'))

    const error = { response: { status: 401 }, config: {} }

    await expect(errorHandlerFn(error)).rejects.toThrow('refresh token invalide')
    expect(sessionManager.handleSessionExpired).toHaveBeenCalled()
  })

  test("ne retente pas indéfiniment (une requête déjà rejouée n'est pas re-interceptée)", async () => {
    const originalRequest: any = { headers: {}, _retry: true }
    const error = { response: { status: 401 }, config: originalRequest }

    await expect(errorHandlerFn(error)).rejects.toBe(error)
    expect(axios.post).not.toHaveBeenCalled()
  })
})
