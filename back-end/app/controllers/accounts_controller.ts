import type { HttpContext } from '@adonisjs/core/http'
import { accountsService } from '../service/account_service.js'

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
    } catch (error) {
        return ctx.response.status(500).json({
            message: 'Erreur lors de la récupération des comptes',
            error: error.message
        })
    }
}
}