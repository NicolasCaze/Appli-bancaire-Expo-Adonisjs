import type { HttpContext } from '@adonisjs/core/http'
import { transactionsService } from '../service/transaction_service.js'

export default class TransactionsController {
        public transactionsService = new transactionsService()
    
        constructor () {
            this.transactionsService = new transactionsService()
        }
    
        public async getMyTransaction(ctx: HttpContext) {
      try {
      const user = ctx.user
      if(!user){
        return ctx.response.status(401).json({
            message: 'Utilisateur non authentifié'
        })
      }
      const data = await this.transactionsService.getMyTransactionService(user.userId)
            return ctx.response.status(200).json(data)
    } catch (error) {
        console.error(error)
        return ctx.response.status(500).json({
            message: 'Erreur lors de la récupération des transactions'
        })
    }
    }
}