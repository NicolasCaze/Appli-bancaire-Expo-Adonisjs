jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), patch: jest.fn() }
}))

jest.mock('../utils/sessionManager', () => ({
  __esModule: true,
  default: { isSessionExpiredError: jest.fn(), handleSessionExpired: jest.fn() }
}))

import api from '../services/api'
import sessionManager from '../utils/sessionManager'
import meService from '../services/meService'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('getProfile', () => {
  test('retourne le profil', async () => {
    const profile = { id: 1, email: 'alice@example.com' }
    ;(api.get as jest.Mock).mockResolvedValue({ data: profile })

    await expect(meService.getProfile()).resolves.toEqual(profile)
  })

  test('gère la session expirée', async () => {
    ;(api.get as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(meService.getProfile()).rejects.toThrow('Votre session a expiré')
  })
})

describe('updateEmail', () => {
  test('appelle le bon endpoint', async () => {
    ;(api.patch as jest.Mock).mockResolvedValue({})

    await meService.updateEmail('nouveau@example.com')

    expect(api.patch).toHaveBeenCalledWith('/me/email', { email: 'nouveau@example.com' })
  })

  test('remonte le message du backend si présent', async () => {
    ;(api.patch as jest.Mock).mockRejectedValue({ response: { data: { message: 'Email déjà utilisé' } } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(meService.updateEmail('x@x.com')).rejects.toThrow('Email déjà utilisé')
  })

  test('message par défaut si le backend ne fournit rien', async () => {
    ;(api.patch as jest.Mock).mockRejectedValue({})
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(meService.updateEmail('x@x.com')).rejects.toThrow("Erreur lors de la mise à jour de l'email")
  })

  test('gère la session expirée', async () => {
    ;(api.patch as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(meService.updateEmail('x@x.com')).rejects.toThrow('Votre session a expiré')
  })
})

describe('updatePassword', () => {
  test('appelle le bon endpoint', async () => {
    ;(api.patch as jest.Mock).mockResolvedValue({})

    await meService.updatePassword('old', 'new')

    expect(api.patch).toHaveBeenCalledWith('/me/password', { currentPassword: 'old', newPassword: 'new' })
  })

  test('remonte le message du backend si présent', async () => {
    ;(api.patch as jest.Mock).mockRejectedValue({ response: { data: { message: 'Mot de passe actuel incorrect' } } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(meService.updatePassword('wrong', 'new')).rejects.toThrow('Mot de passe actuel incorrect')
  })

  test('gère la session expirée', async () => {
    ;(api.patch as jest.Mock).mockRejectedValue({ response: { status: 401 } })
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(true)

    await expect(meService.updatePassword('old', 'new')).rejects.toThrow('Votre session a expiré')
  })

  test('message par défaut si le backend ne fournit rien', async () => {
    ;(api.patch as jest.Mock).mockRejectedValue({})
    ;(sessionManager.isSessionExpiredError as jest.Mock).mockReturnValue(false)

    await expect(meService.updatePassword('old', 'new')).rejects.toThrow('Erreur lors de la mise à jour du mot de passe')
  })
})
