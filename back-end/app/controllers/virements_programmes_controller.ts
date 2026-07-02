import type { HttpContext } from '@adonisjs/core/http'
import { virementsProgrammesService } from '../service/virement_programme_service.js'
import { createVirementProgrammeValidator } from '../validators/virements_programmes_validator.js'

export default class VirementsProgrammesController {
    public virementsProgrammesService = new virementsProgrammesService()

    constructor() {
        this.virementsProgrammesService = new virementsProgrammesService()
    }

    public async getMyVirementsProgrammes(ctx: HttpContext) {
        try {
            const user = ctx.user
            if (!user) {
                return ctx.response.status(401).json({
                    message: 'Utilisateur non authentifié'
                })
            }
            const data = await this.virementsProgrammesService.getMyVirementsProgrammesService(user.userId)
            return ctx.response.status(200).json(data)
        } catch (error) {
            console.error(error)
            return ctx.response.status(500).json({
                message: 'Erreur lors de la récupération des virements programmés'
            })
        }
    }

    public async createVirementProgramme(ctx: HttpContext) {
        try {
            const user = ctx.user
            if (!user) {
                return ctx.response.status(401).json({
                    message: 'Utilisateur non authentifié'
                })
            }

            const payload = await ctx.request.validateUsing(createVirementProgrammeValidator)

            const virementProgramme = await this.virementsProgrammesService.createVirementProgrammeService(
                user.userId,
                payload.compteSourceId,
                payload.beneficiaireId,
                payload.montant,
                payload.libelle ?? 'Virement programmé',
                payload.frequence,
                new Date(payload.dateProchaineExecution),
                payload.dateFin ? new Date(payload.dateFin) : null
            )

            return ctx.response.status(201).json(virementProgramme)
        } catch (error: any) {
            if (error.messages) {
                return ctx.response.status(422).json({
                    message: 'Données invalides',
                    errors: error.messages
                })
            }
            const knownErrors = ['introuvable', 'autorisé', 'appartient', 'positif', 'futur', 'fin', 'bancaire']
            if (knownErrors.some((msg) => error.message?.includes(msg))) {
                return ctx.response.status(400).json({
                    message: error.message
                })
            }

            console.error(error)
            return ctx.response.status(500).json({
                message: 'Erreur lors de la création du virement programmé'
            })
        }
    }

    public async annulerVirementProgramme(ctx: HttpContext) {
        try {
            const user = ctx.user
            if (!user) {
                return ctx.response.status(401).json({
                    message: 'Utilisateur non authentifié'
                })
            }

            const virementProgrammeId = Number(ctx.request.param('id'))
            await this.virementsProgrammesService.annulerVirementProgrammeService(user.userId, virementProgrammeId)
            return ctx.response.status(200).json({
                message: 'Virement programmé annulé'
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
                message: "Erreur lors de l'annulation du virement programmé"
            })
        }
    }
}
