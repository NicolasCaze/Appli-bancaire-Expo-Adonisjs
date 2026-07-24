import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { UsersService } from '../service/users_service.js'
import { createUserValidator } from '../validators/auth_validator.js'

export default class UsersController {
    private usersService: UsersService

    constructor() {
        this.usersService = new UsersService()
    }

    public async createUsers({request, response}: HttpContext){
        try {
            const payload = await request.validateUsing(createUserValidator)
            const result = await this.usersService.createUsersService(payload)

            return response.status(201).json({
                message: 'Utilisateur et compte créés avec succès',
                data: result
            })
        } catch (error) {
            if (error.messages) {
                return response.status(422).json({
                    message: 'Données invalides',
                    errors: error.messages
                })
            }
            logger.error({ err: error }, 'Erreur lors de la création de l\'utilisateur')
            return response.status(500).json({
                message: 'Erreur lors de la création de l\'utilisateur'
            })
        }
    }
}