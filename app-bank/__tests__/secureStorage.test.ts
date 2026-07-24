jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}))

import * as SecureStore from 'expo-secure-store'
import secureStorage from '../services/secureStorage'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('saveTokens / getAccessToken / getRefreshToken / clearTokens', () => {
  test('sauvegarde les deux tokens', async () => {
    await secureStorage.saveTokens('access-1', 'refresh-1')

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'access-1')
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refresh_token', 'refresh-1')
  })

  test('propage une erreur explicite si la sauvegarde échoue', async () => {
    ;(SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('keychain locked'))

    await expect(secureStorage.saveTokens('a', 'b')).rejects.toThrow('Impossible de sauvegarder les tokens')
  })

  test('récupère l\'access token', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('access-1')

    await expect(secureStorage.getAccessToken()).resolves.toBe('access-1')
  })

  test('retourne null si la récupération de l\'access token échoue', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(secureStorage.getAccessToken()).resolves.toBeNull()
  })

  test('récupère le refresh token', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('refresh-1')

    await expect(secureStorage.getRefreshToken()).resolves.toBe('refresh-1')
  })

  test('retourne null si la récupération du refresh token échoue', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(secureStorage.getRefreshToken()).resolves.toBeNull()
  })

  test('supprime les deux tokens', async () => {
    await secureStorage.clearTokens()

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token')
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token')
  })

  test('propage une erreur explicite si la suppression échoue', async () => {
    ;(SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(secureStorage.clearTokens()).rejects.toThrow('Impossible de supprimer les tokens')
  })
})

describe('biometricEnabled', () => {
  test('sauvegarde la préférence à true', async () => {
    await secureStorage.saveBiometricEnabled(true)
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('biometric_enabled', 'true')
  })

  test('propage une erreur explicite si la sauvegarde de la préférence échoue', async () => {
    ;(SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(secureStorage.saveBiometricEnabled(true)).rejects.toThrow('Impossible de sauvegarder la préférence Face ID')
  })

  test('isBiometricEnabled retourne true seulement si la valeur stockée est "true"', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('true')
    await expect(secureStorage.isBiometricEnabled()).resolves.toBe(true)

    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('false')
    await expect(secureStorage.isBiometricEnabled()).resolves.toBe(false)

    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null)
    await expect(secureStorage.isBiometricEnabled()).resolves.toBe(false)
  })

  test('isBiometricEnabled retourne false si la lecture échoue', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('boom'))
    await expect(secureStorage.isBiometricEnabled()).resolves.toBe(false)
  })
})

describe('hasTokens', () => {
  test('retourne true si un access token existe', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('access-1')
    await expect(secureStorage.hasTokens()).resolves.toBe(true)
  })

  test('retourne false si aucun access token', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null)
    await expect(secureStorage.hasTokens()).resolves.toBe(false)
  })
})

describe('credentials (login biométrique)', () => {
  test('sauvegarde email et mot de passe', async () => {
    await secureStorage.saveCredentials('alice@example.com', 'Pass1!')

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user_email', 'alice@example.com')
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user_password', 'Pass1!')
  })

  test('propage une erreur explicite si la sauvegarde des credentials échoue', async () => {
    ;(SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(secureStorage.saveCredentials('a@a.com', 'x')).rejects.toThrow('Impossible de sauvegarder les credentials')
  })

  test('récupère les credentials si les deux existent', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) =>
      Promise.resolve(key === 'user_email' ? 'alice@example.com' : 'Pass1!')
    )

    await expect(secureStorage.getCredentials()).resolves.toEqual({ email: 'alice@example.com', password: 'Pass1!' })
  })

  test('retourne null si un seul des deux est présent', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) =>
      Promise.resolve(key === 'user_email' ? 'alice@example.com' : null)
    )

    await expect(secureStorage.getCredentials()).resolves.toBeNull()
  })

  test('retourne null si la lecture échoue', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(secureStorage.getCredentials()).resolves.toBeNull()
  })

  test('supprime les credentials sans lever d\'erreur même si ça échoue', async () => {
    ;(SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(secureStorage.deleteCredentials()).resolves.toBeUndefined()
  })
})

describe('user', () => {
  const user = { id: 1, email: 'alice@example.com', firstname: 'Alice', lastname: 'Test' }

  test('sauvegarde le user sérialisé en JSON', async () => {
    await secureStorage.saveUser(user as any)

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user', JSON.stringify(user))
  })

  test('propage une erreur explicite si la sauvegarde échoue', async () => {
    ;(SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(secureStorage.saveUser(user as any)).rejects.toThrow('Impossible de sauvegarder le user')
  })

  test('récupère et désérialise le user', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(user))

    await expect(secureStorage.getUser()).resolves.toEqual(user)
  })

  test('retourne null si aucun user sauvegardé', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null)

    await expect(secureStorage.getUser()).resolves.toBeNull()
  })

  test('getUser propage une erreur explicite en cas d\'échec', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(secureStorage.getUser()).rejects.toThrow('Impossible de récupérer le user')
  })

  test('supprime le user', async () => {
    await secureStorage.deleteUser()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user')
  })

  test('propage une erreur explicite si la suppression échoue', async () => {
    ;(SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(secureStorage.deleteUser()).rejects.toThrow('Impossible de supprimer le user')
  })
})
