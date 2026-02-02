import * as LocalAuthentication from 'expo-local-authentication'

/**
 * Service de gestion de l'authentification biométrique
 * Supporte Face ID (iOS), Touch ID (iOS), et empreinte digitale (Android)
 */

class BiometricAuth {
  /**
   * Vérifier si l'appareil supporte la biométrie
   * @returns true si l'appareil a du matériel biométrique, false sinon
   */
  async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()
      return hasHardware && isEnrolled
    } catch (error) {
      console.error('Erreur lors de la vérification de la biométrie:', error)
      return false
    }
  }

  /**
   * Demander l'authentification biométrique
   * @param promptMessage - Message à afficher à l'utilisateur
   * @returns true si l'authentification réussit, false sinon
   */
  async authenticate(promptMessage: string = 'Authentifiez-vous pour continuer'): Promise<boolean> {
    try {
      const available = await this.isAvailable()

      if (!available) {
        return false
      }

      const result = await LocalAuthentication.authenticateAsync({promptMessage})
      return result.success
    } catch (error) {
      console.error('Erreur lors de l\'authentification biométrique:', error)
      return false
    }
  }

  /**
   * Récupérer le type de biométrie disponible
   * @returns 'FaceID', 'TouchID', 'Fingerprint', ou 'None'
   */
  async getBiometricType(): Promise<string> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync()

      if (types.includes(2)) {
        return 'FaceID'
      }

      if (types.includes(1)) {
        return 'TouchID'
      }

      if (types.includes(3)) {
        return 'Fingerprint'
      }

      return 'None'
    } catch (error) {
      console.error('Erreur lors de la récupération du type de biométrie:', error)
      return 'None'
    }
  }
}

export default new BiometricAuth()
