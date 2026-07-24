jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn()
}))

import * as LocalAuthentication from 'expo-local-authentication'
import biometricAuth from '../services/biometricAuth'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('isAvailable', () => {
  test('true si le matériel est présent et un profil biométrique enregistré', async () => {
    ;(LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true)
    ;(LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true)

    await expect(biometricAuth.isAvailable()).resolves.toBe(true)
  })

  test('false si pas de matériel biométrique', async () => {
    ;(LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false)
    ;(LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true)

    await expect(biometricAuth.isAvailable()).resolves.toBe(false)
  })

  test('false si aucun profil biométrique enregistré', async () => {
    ;(LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true)
    ;(LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false)

    await expect(biometricAuth.isAvailable()).resolves.toBe(false)
  })

  test('false si la vérification lève une erreur', async () => {
    ;(LocalAuthentication.hasHardwareAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(biometricAuth.isAvailable()).resolves.toBe(false)
  })
})

describe('authenticate', () => {
  test('retourne false sans authentifier si la biométrie est indisponible', async () => {
    ;(LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false)
    ;(LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false)

    await expect(biometricAuth.authenticate()).resolves.toBe(false)
    expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled()
  })

  test('retourne le résultat de authenticateAsync si disponible', async () => {
    ;(LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true)
    ;(LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true)
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true })

    await expect(biometricAuth.authenticate('Connectez-vous')).resolves.toBe(true)
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({ promptMessage: 'Connectez-vous' })
  })

  test('retourne false si authenticateAsync échoue (annulation, etc.)', async () => {
    ;(LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true)
    ;(LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true)
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: false })

    await expect(biometricAuth.authenticate()).resolves.toBe(false)
  })

  test('retourne false si une erreur est levée', async () => {
    ;(LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true)
    ;(LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true)
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(biometricAuth.authenticate()).resolves.toBe(false)
  })
})

describe('getBiometricType', () => {
  test('retourne FaceID si le type 2 est supporté', async () => {
    ;(LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([2])

    await expect(biometricAuth.getBiometricType()).resolves.toBe('FaceID')
  })

  test('retourne TouchID si le type 1 est supporté', async () => {
    ;(LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([1])

    await expect(biometricAuth.getBiometricType()).resolves.toBe('TouchID')
  })

  test('retourne Fingerprint si le type 3 est supporté', async () => {
    ;(LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([3])

    await expect(biometricAuth.getBiometricType()).resolves.toBe('Fingerprint')
  })

  test('retourne None si aucun type reconnu', async () => {
    ;(LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([])

    await expect(biometricAuth.getBiometricType()).resolves.toBe('None')
  })

  test('retourne None si la vérification échoue', async () => {
    ;(LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockRejectedValue(new Error('boom'))

    await expect(biometricAuth.getBiometricType()).resolves.toBe('None')
  })
})
