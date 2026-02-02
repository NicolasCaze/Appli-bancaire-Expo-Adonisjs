import { prisma } from "../../lib/prisma.js"

export class accountsService {
    public async getMyAccountService(userId: number) {
        try {
            const account = await prisma.account.findMany({
                where: {
                    userId: userId}
            })
            return account
        } catch (error) {
            throw error
        }
    }
}