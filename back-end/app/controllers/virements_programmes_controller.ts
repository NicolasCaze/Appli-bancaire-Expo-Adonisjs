import type { HttpContext } from '@adonisjs/core/http'
import { virementsProgrammesService } from '../service/virement_programme_service.js'

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

            const { compteSourceId, beneficiaireId, montant, libelle, frequence, dateProchaineExecution, dateFin } = ctx.request.body()

            const virementProgramme = await this.virementsProgrammesService.createVirementProgrammeService(
                user.userId,
                compteSourceId,
                beneficiaireId,
                montant,
                libelle,
                frequence,
                new Date(dateProchaineExecution),
                dateFin ? new Date(dateFin) : null
            )

            return ctx.response.status(201).json(virementProgramme)
        } catch (error: any) {
            const knownErrors = ['introuvable', 'autorisé', 'appartient', 'positif', 'futur', 'fin']
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
