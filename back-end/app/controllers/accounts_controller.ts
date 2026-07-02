import type { HttpContext } from '@adonisjs/core/http'
import { accountsService } from '../service/account_service.js'
import { createAccountValidator } from '../validators/accounts_validator.js'

export default class AccountsController {
private accountService: accountsService

    constructor() {
        this.accountService = new accountsService()
    }
    public async getMyAccount(ctx: HttpContext){
    try {
        const user = ctx.user
        if (!user){
            return ctx.response.status(401).json({
                message: 'Utilisateur non authentifié'
            })
        }
        const data = await this.accountService.getMyAccountService(user.userId)
        return ctx.response.status(200).json(data)
    } catch (error: any) {
        console.error(error)
        return ctx.response.status(500).json({
            message: 'Erreur lors de la récupération des comptes'
        })
    }
}

public async createTypeAccount(ctx: HttpContext){
    try {
        const payload = await ctx.request.validateUsing(createAccountValidator)

        const createAccountType = await this.accountService.createAccountTypeService(
            ctx.user!.userId,
            payload.type
        )
        return ctx.response.status(201).json(createAccountType)
    } catch (error: any) {
        if (error.messages) {
            return ctx.response.status(422).json({
                message: 'Données invalides',
                errors: error.messages
            })
        }
        if (error.message?.includes('déjà un compte')) {
            return ctx.response.status(400).json({
                message: error.message
            })
        }

        console.error(error)
        return ctx.response.status(500).json({
            message: 'Erreur lors de la création du compte'
        })
    }
}
}
