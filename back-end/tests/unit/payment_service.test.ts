import { describe, test, expect, vi, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  prisma: {
    payment: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('../../lib/prisma.js', () => prismaMock)

import { paymentService } from '../../app/service/payment_service.js'

const service = new paymentService()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getMyPaymentsService', () => {
  test("retourne les paiements liés aux comptes de l'utilisateur", async () => {
    const payments = [{ id: 1, montant: 42, accountId: 3 }]
    prismaMock.prisma.payment.findMany.mockResolvedValue(payments)

    const result = await service.getMyPaymentsService(10)

    expect(prismaMock.prisma.payment.findMany).toHaveBeenCalledWith({
      where: { account: { userId: 10 } },
    })
    expect(result).toEqual(payments)
  })

  test('retourne un tableau vide si aucun paiement', async () => {
    prismaMock.prisma.payment.findMany.mockResolvedValue([])

    const result = await service.getMyPaymentsService(10)

    expect(result).toEqual([])
  })
})
