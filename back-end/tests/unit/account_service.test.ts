import { describe, test, expect, vi, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  prisma: {
    account: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn()
    }
  }
}))

vi.mock('../../lib/prisma.js', () => prismaMock)

import { accountsService } from '../../app/service/account_service.js'

const service = new accountsService()

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── getMyAccountService ──────────────────────────────────────────────────────

describe('getMyAccountService', () => {
  test('retourne la liste des comptes de l\'utilisateur', async () => {
    const comptes = [
      { id: 1, userId: 10, type: 'BANCAIRE', solde: 500 },
      { id: 2, userId: 10, type: 'EPARGNE', solde: 200 }
    ]
    prismaMock.prisma.account.findMany.mockResolvedValue(comptes)

    const result = await service.getMyAccountService(10)

    expect(prismaMock.prisma.account.findMany).toHaveBeenCalledWith({ where: { userId: 10 } })
    expect(result).toEqual(comptes)
  })

  test('retourne un tableau vide si l\'utilisateur n\'a aucun compte', async () => {
    prismaMock.prisma.account.findMany.mockResolvedValue([])

    const result = await service.getMyAccountService(10)

    expect(result).toEqual([])
  })
})

// ─── createAccountTypeService ─────────────────────────────────────────────────

describe('createAccountTypeService', () => {
  test('crée un compte BANCAIRE si l\'utilisateur n\'en a pas encore', async () => {
    prismaMock.prisma.account.findFirst.mockResolvedValue(null)
    prismaMock.prisma.account.create.mockResolvedValue({ id: 1, userId: 10, type: 'BANCAIRE', solde: 0 })

    const result = await service.createAccountTypeService(10, 'BANCAIRE')

    expect(prismaMock.prisma.account.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 10, type: 'BANCAIRE', solde: 0 }) })
    )
    expect(result).toMatchObject({ type: 'BANCAIRE', solde: 0 })
  })

  test('crée un compte EPARGNE avec le bon label', async () => {
    prismaMock.prisma.account.findFirst.mockResolvedValue(null)
    prismaMock.prisma.account.create.mockResolvedValue({ id: 2, userId: 10, type: 'EPARGNE', solde: 0, label: 'Mon Épargne' })

    const result = await service.createAccountTypeService(10, 'EPARGNE')

    expect(prismaMock.prisma.account.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ label: 'Mon Épargne' }) })
    )
    expect(result).toMatchObject({ type: 'EPARGNE' })
  })

  test('rejette si l\'utilisateur a déjà un compte de ce type', async () => {
    prismaMock.prisma.account.findFirst.mockResolvedValue({ id: 1, userId: 10, type: 'BANCAIRE' })

    await expect(service.createAccountTypeService(10, 'BANCAIRE')).rejects.toThrow('déjà un compte')
    expect(prismaMock.prisma.account.create).not.toHaveBeenCalled()
  })

  test('rejette pour EPARGNE si déjà existant', async () => {
    prismaMock.prisma.account.findFirst.mockResolvedValue({ id: 2, userId: 10, type: 'EPARGNE' })

    await expect(service.createAccountTypeService(10, 'EPARGNE')).rejects.toThrow('déjà un compte')
  })

  test('rejette pour POCKET si déjà existant', async () => {
    prismaMock.prisma.account.findFirst.mockResolvedValue({ id: 3, userId: 10, type: 'POCKET' })

    await expect(service.createAccountTypeService(10, 'POCKET')).rejects.toThrow('déjà un compte')
  })
})
