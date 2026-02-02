import { prisma } from "../../lib/prisma.js"


export class paymentService {
public async getMyPaymentsService(userId: number) {
  const payments = await prisma.payment.findMany({
    where: { account: { userId: userId } }  // ← Via la relation account
  })
  return payments
}   
}