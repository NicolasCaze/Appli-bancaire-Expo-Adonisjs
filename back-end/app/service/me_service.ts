import { prisma } from '../../lib/prisma.js'
import hash from '@adonisjs/core/services/hash'

export class MeService {

    public async getProfile(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                dateNaissance: true,
                lieuNaissance: true,
                adresse: true,
                accounts: {
                    where: { type: 'BANCAIRE' },
                    select: { iban: true, rib: true },
                    take: 1,
                }
            }
        })
        if (!user) throw new Error('Utilisateur introuvable')

        const { accounts, ...rest } = user
        return {
            ...rest,
            iban: accounts[0]?.iban ?? null,
            rib: accounts[0]?.rib ?? null,
        }
    }

    public async updateEmail(userId: number, email: string) {
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing && existing.id !== userId) {
            throw new Error('Cet email est déjà utilisé par un autre compte')
        }
        return await prisma.user.update({
            where: { id: userId },
            data: { email }
        })
    }

    public async updatePassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) throw new Error('Utilisateur introuvable')

        const valid = await hash.verify(user.password, currentPassword)
        if (!valid) throw new Error('Mot de passe actuel incorrect')

        const hashed = await hash.make(newPassword)
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed }
        })
    }
}
