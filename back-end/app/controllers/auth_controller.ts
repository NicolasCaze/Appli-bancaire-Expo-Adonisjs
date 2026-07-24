import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { AuthService } from '../service/auth_service.js'
import { loginValidator, refreshValidator, logoutValidator } from '../validators/auth_validator.js'

export default class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  public async login({ request, response }: HttpContext) {
    try {
     const payload = await request.validateUsing(loginValidator)
    
    const result = await this.authService.login(
      payload.email,
      payload.password,
      payload.deviceInfo,
      request.ip()
    )

      return response.status(201).json({
        message: 'Connexion réussie',
        data: result
      })
    } catch (error) {
      return response.status(401).json({
        message: error.message
      })
    }
  }

  public async refresh({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(refreshValidator)

      const result = await this.authService.refresh(
        payload.refreshToken,
        payload.deviceInfo,
        request.ip()
      )

      return response.status(200).json({
        message: 'Token renouvelé',
        data: result
      })
    } catch (error) {
      if (error.messages) {
        return response.status(422).json({
          message: 'Données invalides',
          errors: error.messages
        })
      }
      return response.status(401).json({
        message: error.message
      })
    }
  }

  public async logout({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(logoutValidator)

      await this.authService.logout(payload.refreshToken)

      return response.status(200).json({
        message: 'Déconnexion réussie'
      })
    } catch (error) {
      if (error.messages) {
        return response.status(422).json({
          message: 'Données invalides',
          errors: error.messages
        })
      }
      logger.error({ err: error }, 'Erreur lors de la déconnexion')
      return response.status(500).json({
        message: 'Erreur lors de la déconnexion'
      })
    }
  }
}
