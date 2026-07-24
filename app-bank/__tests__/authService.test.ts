jest.mock('../services/api', () => ({
  __esModule: true,
  default: { post: jest.fn() }
}))

jest.mock('../services/secureStorage', () => ({
  __esModule: true,
  default: {
    saveTokens: jest.fn(),
    saveUser: jest.fn(),
    getRefreshToken: jest.fn(),
    clearTokens: jest.fn(),
    deleteUser: jest.fn(),
    hasTokens: jest.fn()
  }
}))

import api from '../services/api'
import secureStorage from '../services/secureStorage'
import authService from '../services/authService'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('login', () => {
  const backendResponse = {
    data: {
      message: 'Connexion réussie',
      data: {
        user: { id: 1, email: 'alice@example.com', firstname: 'Alice', lastname: 'Test' },
        tokens: { accessToken: 'access-1', refreshToken: 'refresh-1' }
      }
    }
  }

  test('sauvegarde les tokens et le user, retourne le user', async () => {
    ;(api.post as jest.Mock).mockResolvedValue(backendResponse)

    const user = await authService.login('alice@example.com', 'Pass1!')

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'alice@example.com',
      password: 'Pass1!',
      deviceInfo: 'mobile-app'
    })
    expect(secureStorage.saveTokens).toHaveBeenCalledWith('access-1', 'refresh-1')
    expect(secureStorage.saveUser).toHaveBeenCalledWith(backendResponse.data.data.user)
    expect(user).toEqual(backendResponse.data.data.user)
  })

  test('remonte un message explicite sur identifiants incorrects (401)', async () => {
    ;(api.post as jest.Mock).mockRejectedValue({ response: { status: 401 } })

    await expect(authService.login('alice@example.com', 'wrong')).rejects.toThrow('Email ou mot de passe incorrect')
    expect(secureStorage.saveTokens).not.toHaveBeenCalled()
  })

  test('remonte un message générique sur toute autre erreur', async () => {
    ;(api.post as jest.Mock).mockRejectedValue(new Error('Network Error'))

    await expect(authService.login('alice@example.com', 'Pass1!')).rejects.toThrow('Erreur de connexion au serveur')
  })
})

describe('logout', () => {
  test('révoque le refresh token côté serveur puis nettoie le stockage local', async () => {
    ;(secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-1')
    ;(api.post as jest.Mock).mockResolvedValue({})

    await authService.logout()

    expect(api.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'refresh-1' })
    expect(secureStorage.clearTokens).toHaveBeenCalled()
    expect(secureStorage.deleteUser).toHaveBeenCalled()
  })

  test("ne fait pas d'appel serveur si aucun refresh token localement", async () => {
    ;(secureStorage.getRefreshToken as jest.Mock).mockResolvedValue(null)

    await authService.logout()

    expect(api.post).not.toHaveBeenCalled()
    expect(secureStorage.clearTokens).toHaveBeenCalled()
  })

  test('nettoie quand même le stockage local si l\'appel serveur échoue', async () => {
    ;(secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-1')
    ;(api.post as jest.Mock).mockRejectedValue(new Error('Network Error'))

    await expect(authService.logout()).rejects.toThrow('Erreur lors de la déconnexion')
    expect(secureStorage.clearTokens).toHaveBeenCalled()
  })
})

describe('isAuthenticated', () => {
  test('reflète la présence de tokens en stockage sécurisé', async () => {
    ;(secureStorage.hasTokens as jest.Mock).mockResolvedValue(true)
    await expect(authService.isAuthenticated()).resolves.toBe(true)

    ;(secureStorage.hasTokens as jest.Mock).mockResolvedValue(false)
    await expect(authService.isAuthenticated()).resolves.toBe(false)
  })
})
