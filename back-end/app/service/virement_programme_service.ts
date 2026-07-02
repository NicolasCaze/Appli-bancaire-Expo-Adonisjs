import { prisma } from "../../lib/prisma.js"

function calculerProchaineDate(date: Date, frequence: 'QUOTIDIEN' | 'HEBDOMADAIRE' | 'MENSUEL'): Date {
    const next = new Date(date)
    if (frequence === 'QUOTIDIEN') {
        next.setDate(next.getDate() + 1)
    } else if (frequence === 'HEBDOMADAIRE') {
        next.setDate(next.getDate() + 7)
    } else {
        next.setMonth(next.getMonth() + 1)
    }
    return next
}

export class virementsProgrammesService {

    public async getMyVirementsProgrammesService(userId: number) {
        return await prisma.virementProgramme.findMany({
            where: { compteSource: { userId } },
            include: { beneficiaire: true }
        })
    }

    public async createVirementProgrammeService(
        userId: number,
        compteSourceId: number,
        beneficiaireId: number,
        montant: number,
        libelle: string,
        frequence: 'UNIQUE' | 'QUOTIDIEN' | 'HEBDOMADAIRE' | 'MENSUEL',
        dateProchaineExecution: Date,
        dateFin?: Date | null
    ) {
        if (!montant || montant <= 0) {
            throw new Error('Le montant doit être positif')
        }
        if (dateProchaineExecution.getTime() < Date.now()) {
            throw new Error("La date d'exécution doit être dans le futur")
        }
        if (dateFin && dateFin.getTime() < dateProchaineExecution.getTime()) {
            throw new Error("La date de fin doit être après la date d'exécution")
        }

        const compteSource = await prisma.account.findUnique({
            where: { id: compteSourceId }
        })
        if (!compteSource) {
            throw new Error('Compte source introuvable')
        }
        if (compteSource.userId !== userId) {
            throw new Error("Vous n'êtes pas autorisé à programmer un virement depuis ce compte")
        }
        if (compteSource.type !== 'BANCAIRE') {
            throw new Error('Seul le compte bancaire peut servir de compte source pour un virement programmé')
        }

        const beneficiaire = await prisma.beneficiaire.findUnique({
            where: { id: beneficiaireId }
        })
        if (!beneficiaire) {
            throw new Error('Bénéficiaire introuvable')
        }
        if (beneficiaire.userId !== userId) {
            throw new Error("Ce bénéficiaire n'appartient pas à votre compte")
        }

        return await prisma.virementProgramme.create({
            data: {
                compteSourceId,
                beneficiaireId,
                montant,
                libelle,
                frequence,
                dateProchaineExecution,
                dateFin: dateFin ?? null
            }
        })
    }

    public async annulerVirementProgrammeService(userId: number, virementProgrammeId: number) {
        const virementProgramme = await prisma.virementProgramme.findUnique({
            where: { id: virementProgrammeId },
            include: { compteSource: true }
        })
        if (!virementProgramme) {
            throw new Error('Virement programmé introuvable')
        }
        if (virementProgramme.compteSource.userId !== userId) {
            throw new Error("Vous n'êtes pas autorisé à annuler ce virement programmé")
        }

        await prisma.virementProgramme.update({
            where: { id: virementProgrammeId },
            data: { statut: 'TERMINE' }
        })
    }

    /**
     * Exécute tous les virements programmés arrivés à échéance.
     * Destiné à être appelé par une tâche planifiée (cron / commande Ace).
     */
    public async executerVirementsDusService() {
        const virementsDus = await prisma.virementProgramme.findMany({
            where: {
                statut: 'ACTIF',
                dateProchaineExecution: { lte: new Date() }
            }
        })

        const resultats = { executes: 0, echoues: 0 }

        for (const virement of virementsDus) {
            try {
                await prisma.$transaction(async (tx) => {
                    // Débit atomique : évite la race condition si un autre virement
                    // débite le même compte en même temps.
                    const debit = await tx.account.updateMany({
                        where: { id: virement.compteSourceId, solde: { gte: virement.montant } },
                        data: { solde: { decrement: virement.montant } }
                    })
                    if (debit.count === 0) {
                        throw new Error('Solde insuffisant')
                    }

                    await tx.transaction.create({
                        data: {
                            compteSourceId: virement.compteSourceId,
                            beneficiaireId: virement.beneficiaireId,
                            montant: virement.montant,
                            type: 'EXTERNAL',
                            statut: 'EFFECTUEE',
                            libelle: virement.libelle
                        }
                    })

                    if (virement.frequence === 'UNIQUE') {
                        await tx.virementProgramme.update({
                            where: { id: virement.id },
                            data: { statut: 'TERMINE' }
                        })
                        return
                    }

                    const prochaineDate = calculerProchaineDate(virement.dateProchaineExecution, virement.frequence)
                    const estTermine = virement.dateFin !== null && prochaineDate.getTime() > virement.dateFin.getTime()

                    await tx.virementProgramme.update({
                        where: { id: virement.id },
                        data: estTermine
                            ? { statut: 'TERMINE' }
                            : { dateProchaineExecution: prochaineDate }
                    })
                })

                resultats.executes++
            } catch (error) {
                // Solde insuffisant ou autre erreur : on laisse le virement ACTIF,
                // il sera retenté à la prochaine exécution de la tâche planifiée.
                resultats.echoues++
            }
        }

        return resultats
    }
}
