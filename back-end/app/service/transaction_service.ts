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
}