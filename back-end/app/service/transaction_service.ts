import { prisma } from "../../lib/prisma.js"

export class transactionsService {

    public async getMyTransactionService(userId: number) {
        const transactions = await prisma.transaction.findMany({
            where: {
                OR: [
                    { compteSource: { userId: userId } },
                    { compteDestination: { userId: userId } }
                ]
            }
        })
        return transactions
    }

    public async createTransactionService(
        userId: number,
        compteSourceId: number,
        compteDestinationId: number,
        montant: number,
        libelle: string
    ) {
        if (compteSourceId === compteDestinationId) {
            throw new Error('Le compte source et le compte destination doivent être différents')
        }
        if (!montant || montant <= 0) {
            throw new Error('Le montant doit être positif')
        }

        return await prisma.$transaction(async (tx) => {
            const compteSource = await tx.account.findUnique({
                where: { id: compteSourceId }
            })
            if (!compteSource) {
                throw new Error('Compte source introuvable')
            }
            if (compteSource.userId !== userId) {
                throw new Error("Vous n'êtes pas autorisé à effectuer un virement depuis ce compte")
            }

            const compteDestination = await tx.account.findUnique({
                where: { id: compteDestinationId }
            })
            if (!compteDestination) {
                throw new Error('Compte destination introuvable')
            }

            // Débit atomique : la condition solde >= montant est vérifiée par la base
            // au moment de l'update, ce qui évite la race condition d'un lire-puis-écrire
            // entre deux virements concurrents sur le même compte.
            const debit = await tx.account.updateMany({
                where: { id: compteSourceId, solde: { gte: montant } },
                data: { solde: { decrement: montant } }
            })
            if (debit.count === 0) {
                throw new Error('Solde insuffisant sur le compte source')
            }

            await tx.account.update({
                where: { id: compteDestinationId },
                data: { solde: { increment: montant } }
            })

            const transaction = await tx.transaction.create({
                data: {
                    compteSourceId,
                    compteDestinationId,
                    montant,
                    type: 'INTERNAL',
                    statut: 'EFFECTUEE',
                    libelle
                }
            })

            return transaction
        })
    }
}
