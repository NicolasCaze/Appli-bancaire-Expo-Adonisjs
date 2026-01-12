import type { HttpContext } from '@adonisjs/core/http'
import { UsersService } from '../service/users_Service.js'
import { createUserValidator } from '../validators/auth_validator.js'

type Users = {
    firstname : string,
    lastname: string,
    email: string,
    dateNaissance: Date,
    lieuNaissance: string,
    adresse: string,
    password: string
}

export default class UsersController {
    private usersService: UsersService

    constructor() {
        this.usersService = new UsersService()
    }
    
    public async index({response}: HttpContext){
        try {
            const data = await this.usersService.getAllUsersService()
            return response.status(200).json(data)
        } catch (error) {
            return response.status(500).json({
                message: 'Erreur lors de la récupération des utilisateurs',
                error: error.message
            })
        }
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
            console.error('Erreur lors de la création:', error)
            return response.status(500).json({
                message: 'Erreur lors de la création de l\'utilisateur',
                error: error.message
            })
        }
    }

}