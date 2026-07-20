import type { HttpContext } from '@adonisjs/core/http'
import { paymentService } from '../service/payment_service.js'

export default class PaymentsController {
    public paymentsService = new paymentService()

    public async getMyPayments(ctx: HttpContext) {
        try {
            const user = ctx.user
            if (!user) return ctx.response.status(401).json({ message: 'Utilisateur non authentifié' })
            const data = await this.paymentsService.getMyPaymentsService(user.userId)
            return ctx.response.status(200).json(data)
        } catch (error) {
            console.error(error)
            return ctx.response.status(500).json({ message: 'Erreur lors de la récupération des paiements' })
        }
    }
}
