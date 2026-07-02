import type { HttpContext } from '@adonisjs/core/http'
import { transactionsService } from '../service/transaction_service.js'
import { createTransactionValidator, createVirementBeneficiaireValidator } from '../validators/transactions_validator.js'

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

    public async createTransaction(ctx: HttpContext) {
        try {
            const user = ctx.user
            if (!user) {
                return ctx.response.status(401).json({
                    message: 'Utilisateur non authentifié'
                })
            }

            const payload = await ctx.request.validateUsing(createTransactionValidator)

            const transaction = await this.transactionsService.createTransactionService(
                user.userId,
                payload.compteSourceId,
                payload.compteDestinationId,
                payload.montant,
                payload.libelle ?? 'Virement'
            )

            return ctx.response.status(201).json(transaction)
        } catch (error: any) {
            if (error.messages) {
                return ctx.response.status(422).json({
                    message: 'Données invalides',
                    errors: error.messages
                })
            }
            const knownErrors = ['introuvable', 'autorisé', 'insuffisant', 'différents', 'positif', 'bancaire']
            if (knownErrors.some((msg) => error.message?.includes(msg))) {
                return ctx.response.status(400).json({
                    message: error.message
                })
            }

            console.error(error)
            return ctx.response.status(500).json({
                message: 'Erreur lors de la création de la transaction'
            })
        }
}

    public async createVirementBeneficiaire(ctx: HttpContext) {
        try {
            const user = ctx.user
            if (!user) {
                return ctx.response.status(401).json({
                    message: 'Utilisateur non authentifié'
                })
            }

            const payload = await ctx.request.validateUsing(createVirementBeneficiaireValidator)

            const transaction = await this.transactionsService.createVirementBeneficiaireService(
                user.userId,
                payload.compteSourceId,
                payload.beneficiaireId,
                payload.montant,
                payload.libelle ?? 'Virement'
            )

            return ctx.response.status(201).json(transaction)
        } catch (error: any) {
            if (error.messages) {
                return ctx.response.status(422).json({
                    message: 'Données invalides',
                    errors: error.messages
                })
            }
            const knownErrors = ['introuvable', 'autorisé', 'insuffisant', 'positif', 'appartient', 'bancaire']
            if (knownErrors.some((msg) => error.message?.includes(msg))) {
                return ctx.response.status(400).json({
                    message: error.message
                })
            }

            console.error(error)
            return ctx.response.status(500).json({
                message: 'Erreur lors de la création du virement'
            })
        }
    }
}
