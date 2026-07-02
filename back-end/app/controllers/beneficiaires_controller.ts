import type { HttpContext } from '@adonisjs/core/http'
import { beneficiairesService } from '../service/beneficiaire_service.js'

export default class BeneficiairesController {
    public beneficiairesService = new beneficiairesService()

    constructor() {
        this.beneficiairesService = new beneficiairesService()
    }

    public async getMyBeneficiaires(ctx: HttpContext) {
        try {
            const user = ctx.user
            if (!user) {
                return ctx.response.status(401).json({
                    message: 'Utilisateur non authentifié'
                })
            }
            const data = await this.beneficiairesService.getMyBeneficiairesService(user.userId)
            return ctx.response.status(200).json(data)
        } catch (error) {
            console.error(error)
            return ctx.response.status(500).json({
                message: 'Erreur lors de la récupération des bénéficiaires'
            })
        }
    }

    public async createBeneficiaire(ctx: HttpContext) {
        try {
            const user = ctx.user
            if (!user) {
                return ctx.response.status(401).json({
                    message: 'Utilisateur non authentifié'
                })
            }

            const { nom, iban } = ctx.request.body()
            const beneficiaire = await this.beneficiairesService.createBeneficiaireService(user.userId, nom, iban)
            return ctx.response.status(201).json(beneficiaire)
        } catch (error: any) {
            const knownErrors = ['requis', 'existe déjà']
            if (knownErrors.some((msg) => error.message?.includes(msg))) {
                return ctx.response.status(400).json({
                    message: error.message
                })
            }

            console.error(error)
            return ctx.response.status(500).json({
                message: 'Erreur lors de la création du bénéficiaire'
            })
        }
    }

    public async deleteBeneficiaire(ctx: HttpContext) {
        try {
            const user = ctx.user
            if (!user) {
                return ctx.response.status(401).json({
                    message: 'Utilisateur non authentifié'
                })
            }

            const beneficiaireId = Number(ctx.request.param('id'))
            await this.beneficiairesService.deleteBeneficiaireService(user.userId, beneficiaireId)
            return ctx.response.status(200).json({
                message: 'Bénéficiaire supprimé'
            })
        } catch (error: any) {
            const knownErrors = ['introuvable', 'autorisé']
            if (knownErrors.some((msg) => error.message?.includes(msg))) {
                return ctx.response.status(400).json({
                    message: error.message
                })
            }

            console.error(error)
            return ctx.response.status(500).json({
                message: 'Erreur lors de la suppression du bénéficiaire'
            })
        }
    }
}
