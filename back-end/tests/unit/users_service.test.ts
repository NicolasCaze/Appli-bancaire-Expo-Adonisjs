import { describe, test, expect, vi, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => {
  const tx = {
    user: { create: vi.fn() },
    account: { create: vi.fn() },
    beneficiaire: { create: vi.fn() },
  }
  return {
    prisma: {
      $transaction: vi.fn(async (callback: any) => callback(tx)),
    },
    tx,
  }
})

const hashMock = vi.hoisted(() => ({
  default: { make: vi.fn(async (password: string) => `hashed-${password}`) },
}))

const loggerMock = vi.hoisted(() => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('../../lib/prisma.js', () => ({ prisma: prismaMock.prisma }))
vi.mock('@adonisjs/core/services/hash', () => hashMock)
vi.mock('@adonisjs/core/services/logger', () => loggerMock)

import { UsersService } from '../../app/service/users_service.js'

const service = new UsersService()

const userData = {
  firstname: 'Alice',
  lastname: 'Test',
  email: 'alice@example.com',
  dateNaissance: new Date('2000-01-01'),
  lieuNaissance: 'Paris',
  adresse: '1 rue de Test',
  password: 'Password1!',
}

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.tx.user.create.mockResolvedValue({ id: 1, ...userData, password: 'hashed-Password1!' })
})

describe('createUsersService', () => {
  test('crée un utilisateur avec le mot de passe haché', async () => {
    prismaMock.tx.account.create.mockResolvedValue({
      id: 1,
      userId: 1,
      type: 'BANCAIRE',
      solde: 100,
    })
    prismaMock.tx.beneficiaire.create.mockResolvedValue({ id: 1, userId: 1, nom: 'Jean Dupont' })

    await service.createUsersService(userData)

    expect(hashMock.default.make).toHaveBeenCalledWith('Password1!')
    expect(prismaMock.tx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'alice@example.com',
          password: 'hashed-Password1!',
        }),
      })
    )
  })

  test('crée un compte BANCAIRE avec un solde de départ de 100€ et un IBAN/RIB générés', async () => {
    prismaMock.tx.account.create.mockResolvedValue({
      id: 1,
      userId: 1,
      type: 'BANCAIRE',
      solde: 100,
    })
    prismaMock.tx.beneficiaire.create.mockResolvedValue({ id: 1, userId: 1, nom: 'Jean Dupont' })

    await service.createUsersService(userData)

    expect(prismaMock.tx.account.create).toHaveBeenCalledTimes(1)
    const callArg = prismaMock.tx.account.create.mock.calls[0][0]
    expect(callArg.data.type).toBe('BANCAIRE')
    expect(callArg.data.solde).toBe(100)
    expect(callArg.data.userId).toBe(1)
    // L'IBAN généré doit être assez long pour passer la validation du formulaire
    // d'ajout de bénéficiaire (minLength 15) — cf. bug corrigé où l'IBAN ne faisait que ~12 caractères.
    expect(callArg.data.iban).toMatch(/^FR\d{25}$/)
    expect(callArg.data.iban.length).toBeGreaterThanOrEqual(15)
    expect(callArg.data.rib).toMatch(/^\d{8,10}$/)
  })

  test('crée un bénéficiaire de démonstration pour permettre de tester immédiatement', async () => {
    prismaMock.tx.account.create.mockResolvedValue({
      id: 1,
      userId: 1,
      type: 'BANCAIRE',
      solde: 100,
    })
    prismaMock.tx.beneficiaire.create.mockResolvedValue({ id: 1, userId: 1, nom: 'Jean Dupont' })

    const result = await service.createUsersService(userData)

    expect(prismaMock.tx.beneficiaire.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 1, nom: 'Jean Dupont' }) })
    )
    expect(result.beneficiaire).toMatchObject({ nom: 'Jean Dupont' })
  })

  test('retourne user, account et beneficiaire ensemble', async () => {
    prismaMock.tx.account.create.mockResolvedValue({
      id: 1,
      userId: 1,
      type: 'BANCAIRE',
      solde: 100,
    })
    prismaMock.tx.beneficiaire.create.mockResolvedValue({ id: 1, userId: 1, nom: 'Jean Dupont' })

    const result = await service.createUsersService(userData)

    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('account')
    expect(result).toHaveProperty('beneficiaire')
  })

  test("propage l'erreur si la création échoue dans la transaction (rollback implicite)", async () => {
    prismaMock.tx.account.create.mockRejectedValue(new Error('DB crash'))

    await expect(service.createUsersService(userData)).rejects.toThrow('DB crash')
    expect(prismaMock.tx.beneficiaire.create).not.toHaveBeenCalled()
  })
})
