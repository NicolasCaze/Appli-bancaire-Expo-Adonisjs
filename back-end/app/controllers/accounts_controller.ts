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
    } catch (error: any) {
        return ctx.response.status(500).json({
            message: 'Erreur lors de la récupération des comptes',
            error: error.message
        })
    }
}

public async createTypeAccount(ctx: HttpContext){
    try {
        const type = ctx.request.input('type')
        
        // Validation du type
        if (!['BANCAIRE', 'EPARGNE', 'POCKET'].includes(type)) {
            return ctx.response.status(400).json({
                message: 'Type de compte invalide. Types acceptés: BANCAIRE, EPARGNE, POCKET'
            })
        }
        
        const createAccountType = await this.accountService.createAccountTypeService(
            ctx.user!.userId, 
            type
        )
        return ctx.response.status(201).json(createAccountType)
    } catch (error: any) {
        // Si c'est une erreur "compte déjà existant", retourner 400 au lieu de 500
        if (error.message.includes('déjà un compte')) {
            return ctx.response.status(400).json({
                message: error.message
            })
        }
        
        return ctx.response.status(500).json({
            message: 'Erreur lors de la création du compte',
            error: error.message
        })
    }
}
}