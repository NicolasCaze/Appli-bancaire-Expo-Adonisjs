import { prisma } from "../../lib/prisma.js"

export class beneficiairesService {

    public async getMyBeneficiairesService(userId: number) {
        const beneficiaires = await prisma.beneficiaire.findMany({
            where: { userId }
        })
        return beneficiaires
    }

    public async createBeneficiaireService(userId: number, nom: string, iban: string) {
        if (!nom || !nom.trim()) {
            throw new Error('Le nom du bénéficiaire est requis')
        }
        if (!iban || !iban.trim()) {
            throw new Error("L'IBAN est requis")
        }

        const existing = await prisma.beneficiaire.findFirst({
            where: { userId, iban }
        })
        if (existing) {
            throw new Error('Ce bénéficiaire existe déjà')
        }

        const beneficiaire = await prisma.beneficiaire.create({
            data: { userId, nom, iban }
        })
        return beneficiaire
    }

    public async deleteBeneficiaireService(userId: number, beneficiaireId: number) {
        const beneficiaire = await prisma.beneficiaire.findUnique({
            where: { id: beneficiaireId }
        })
        if (!beneficiaire) {
            throw new Error('Bénéficiaire introuvable')
        }
        if (beneficiaire.userId !== userId) {
            throw new Error("Vous n'êtes pas autorisé à supprimer ce bénéficiaire")
        }

        await prisma.beneficiaire.delete({ where: { id: beneficiaireId } })
    }
}
