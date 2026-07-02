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

    public async createAccountTypeService(userId: number, type: 'BANCAIRE' | 'EPARGNE' | 'POCKET'){
        try{
            const existingAccount = await prisma.account.findFirst({
            where: {
                userId: userId,
                type: type
            }
        })
        if (existingAccount){
            throw new Error(`Vous avez déjà un compte de type ${type}`)
        }
        const newAccount = await prisma.account.create({
            data: {
                userId: userId,
                type: type,
                solde: 0,  // Solde initial à 0
                label: type === 'EPARGNE' ? 'Mon Épargne' : 'Ma Pocket'
            }
        })
        return newAccount
    } catch (error) {
        throw error
    }
}
}