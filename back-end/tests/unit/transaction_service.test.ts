import { describe, test, expect, vi, beforeEach } from 'vitest'

// Prisma mock hoisted so it's available before the module import
const prismaMock = vi.hoisted(() => {
  const tx = {
    account: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    beneficiaire: {
      findUnique: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
  }

  return {
    prisma: {
      $transaction: vi.fn(),
      account: { findUnique: vi.fn(), findMany: vi.fn() },
      transaction: { findMany: vi.fn() },
      _tx: tx,
    },
  }
})

vi.mock('../../lib/prisma.js', () => prismaMock)

import { transactionsService } from '../../app/service/transaction_service.js'

const service = new transactionsService()

// Raccourcis pour accéder au tx interne réutilisé dans les mocks $transaction
function setupTx(overrides: Partial<typeof prismaMock.prisma._tx> = {}) {
  const tx = { ...prismaMock.prisma._tx, ...overrides }
  prismaMock.prisma.$transaction.mockImplementation((fn: (tx: unknown) => unknown) => fn(tx))
  return tx
}

const compteSource = { id: 1, userId: 10, solde: 500, type: 'BANCAIRE' }
const compteDestination = { id: 2, userId: 10, solde: 100, type: 'EPARGNE' }
const beneficiaire = { id: 5, userId: 10, nom: 'Jean Dupont', iban: 'FR7630004028379876543210943' }

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── Virements internes ───────────────────────────────────────────────────────

describe('createTransactionService — virement interne', () => {
  test('cas nominal : solde source débité ET solde cible crédité', async () => {
    const tx = setupTx()
    tx.account.findUnique
      .mockResolvedValueOnce(compteSource)
      .mockResolvedValueOnce(compteDestination)
    tx.account.updateMany.mockResolvedValue({ count: 1 })
    tx.account.update.mockResolvedValue({})
    tx.transaction.create.mockResolvedValue({
      id: 1,
      type: 'INTERNAL',
      statut: 'EFFECTUEE',
      montant: 200,
    })

    const result = await service.createTransactionService(10, 1, 2, 200, 'Virement')

    expect(tx.account.updateMany).toHaveBeenCalledWith({
      where: { id: 1, solde: { gte: 200 } },
      data: { solde: { decrement: 200 } },
    })
    expect(tx.account.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { solde: { increment: 200 } },
    })
    expect(result).toMatchObject({ type: 'INTERNAL', statut: 'EFFECTUEE' })
  })

  test('atomicité : si le crédit échoue, la transaction est annulée (rollback)', async () => {
    const tx = setupTx()
    tx.account.findUnique
      .mockResolvedValueOnce(compteSource)
      .mockResolvedValueOnce(compteDestination)
    tx.account.updateMany.mockResolvedValue({ count: 1 })
    tx.account.update.mockRejectedValue(new Error('DB crash'))

    await expect(service.createTransactionService(10, 1, 2, 200, 'Virement')).rejects.toThrow(
      'DB crash'
    )
  })

  test('montant négatif → rejet avant toute modification', async () => {
    await expect(service.createTransactionService(10, 1, 2, -50, 'Virement')).rejects.toThrow(
      'positif'
    )
    expect(prismaMock.prisma.$transaction).not.toHaveBeenCalled()
  })

  test('montant nul → rejet avant toute modification', async () => {
    await expect(service.createTransactionService(10, 1, 2, 0, 'Virement')).rejects.toThrow(
      'positif'
    )
    expect(prismaMock.prisma.$transaction).not.toHaveBeenCalled()
  })

  test('solde insuffisant → rejet, aucun solde modifié', async () => {
    const tx = setupTx()
    tx.account.findUnique
      .mockResolvedValueOnce(compteSource)
      .mockResolvedValueOnce(compteDestination)
    tx.account.updateMany.mockResolvedValue({ count: 0 }) // condition solde >= montant non satisfaite

    await expect(service.createTransactionService(10, 1, 2, 1000, 'Virement')).rejects.toThrow(
      'insuffisant'
    )
    expect(tx.account.update).not.toHaveBeenCalled()
  })

  test('compte source introuvable → erreur 404, aucun solde modifié', async () => {
    const tx = setupTx()
    tx.account.findUnique.mockResolvedValueOnce(null)

    await expect(service.createTransactionService(10, 999, 2, 100, 'Virement')).rejects.toThrow(
      'introuvable'
    )
    expect(tx.account.updateMany).not.toHaveBeenCalled()
  })

  test('compte destination introuvable → erreur 404, aucun solde modifié', async () => {
    const tx = setupTx()
    tx.account.findUnique.mockResolvedValueOnce(compteSource).mockResolvedValueOnce(null)
    tx.account.updateMany.mockResolvedValue({ count: 1 })

    await expect(service.createTransactionService(10, 1, 999, 100, 'Virement')).rejects.toThrow(
      'introuvable'
    )
  })

  test('virement vers soi-même → rejet', async () => {
    await expect(service.createTransactionService(10, 1, 1, 100, 'Virement')).rejects.toThrow(
      'différents'
    )
    expect(prismaMock.prisma.$transaction).not.toHaveBeenCalled()
  })

  test('virement depuis un compte ÉPARGNE vers BANCAIRE → succès', async () => {
    const tx = setupTx()
    const compteEpargne = { ...compteSource, id: 3, type: 'EPARGNE', solde: 300 }
    tx.account.findUnique.mockResolvedValueOnce(compteEpargne).mockResolvedValueOnce(compteSource)
    tx.account.updateMany.mockResolvedValue({ count: 1 })
    tx.account.update.mockResolvedValue({})
    tx.transaction.create.mockResolvedValue({ id: 99, type: 'INTERNAL', statut: 'EFFECTUEE' })

    const result = await service.createTransactionService(10, 3, 1, 100, 'Virement épargne')
    expect(result).toMatchObject({ type: 'INTERNAL', statut: 'EFFECTUEE' })
  })

  test("isolation utilisateur : virement depuis compte d'un autre user → rejet 403", async () => {
    const tx = setupTx()
    tx.account.findUnique.mockResolvedValueOnce({ ...compteSource, userId: 99 })

    await expect(service.createTransactionService(10, 1, 2, 100, 'Virement')).rejects.toThrow(
      'autorisé'
    )
    expect(tx.account.updateMany).not.toHaveBeenCalled()
  })

  test("isolation utilisateur : virement vers le compte d'un autre user → rejet, aucun solde modifié", async () => {
    const tx = setupTx()
    tx.account.findUnique
      .mockResolvedValueOnce(compteSource)
      .mockResolvedValueOnce({ ...compteDestination, userId: 99 })

    await expect(service.createTransactionService(10, 1, 2, 100, 'Virement')).rejects.toThrow(
      'autorisé'
    )
    expect(tx.account.updateMany).not.toHaveBeenCalled()
  })
})

// ─── Virements externes (bénéficiaire) ───────────────────────────────────────

describe('createVirementBeneficiaireService — virement externe', () => {
  test('cas nominal : compte source débité, transaction enregistrée avec bénéficiaire', async () => {
    const tx = setupTx()
    tx.account.findUnique.mockResolvedValueOnce(compteSource)
    tx.beneficiaire.findUnique.mockResolvedValueOnce(beneficiaire)
    tx.account.updateMany.mockResolvedValue({ count: 1 })
    tx.transaction.create.mockResolvedValue({
      id: 2,
      type: 'EXTERNAL',
      statut: 'EFFECTUEE',
      beneficiaireId: 5,
    })

    const result = await service.createVirementBeneficiaireService(10, 1, 5, 150, 'Virement ext')

    expect(tx.account.updateMany).toHaveBeenCalledWith({
      where: { id: 1, solde: { gte: 150 } },
      data: { solde: { decrement: 150 } },
    })
    expect(tx.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ beneficiaireId: 5, type: 'EXTERNAL' }),
      })
    )
    expect(result).toMatchObject({ type: 'EXTERNAL', beneficiaireId: 5 })
  })

  test('bénéficiaire inexistant → rejet, aucun solde modifié', async () => {
    const tx = setupTx()
    tx.account.findUnique.mockResolvedValueOnce(compteSource)
    tx.beneficiaire.findUnique.mockResolvedValueOnce(null)

    await expect(
      service.createVirementBeneficiaireService(10, 1, 999, 100, 'Virement')
    ).rejects.toThrow('introuvable')
    expect(tx.account.updateMany).not.toHaveBeenCalled()
  })

  test('bénéficiaire appartenant à un autre user → rejet', async () => {
    const tx = setupTx()
    tx.account.findUnique.mockResolvedValueOnce(compteSource)
    tx.beneficiaire.findUnique.mockResolvedValueOnce({ ...beneficiaire, userId: 99 })

    await expect(
      service.createVirementBeneficiaireService(10, 1, 5, 100, 'Virement')
    ).rejects.toThrow('appartient')
    expect(tx.account.updateMany).not.toHaveBeenCalled()
  })

  test('compte source introuvable → rejet', async () => {
    const tx = setupTx()
    tx.account.findUnique.mockResolvedValueOnce(null)

    await expect(
      service.createVirementBeneficiaireService(10, 999, 5, 100, 'Virement')
    ).rejects.toThrow('introuvable')
  })

  test('isolation utilisateur : compte source appartenant à un autre user → rejet', async () => {
    const tx = setupTx()
    tx.account.findUnique.mockResolvedValueOnce({ ...compteSource, userId: 99 })

    await expect(
      service.createVirementBeneficiaireService(10, 1, 5, 100, 'Virement')
    ).rejects.toThrow('autorisé')
  })

  test('compte source non BANCAIRE → rejet', async () => {
    const tx = setupTx()
    tx.account.findUnique.mockResolvedValueOnce({ ...compteSource, type: 'EPARGNE' })

    await expect(
      service.createVirementBeneficiaireService(10, 1, 5, 100, 'Virement')
    ).rejects.toThrow('bancaire')
  })

  test('montant nul ou négatif → rejet avant toute modification', async () => {
    await expect(
      service.createVirementBeneficiaireService(10, 1, 5, 0, 'Virement')
    ).rejects.toThrow('positif')
    await expect(
      service.createVirementBeneficiaireService(10, 1, 5, -10, 'Virement')
    ).rejects.toThrow('positif')
    expect(prismaMock.prisma.$transaction).not.toHaveBeenCalled()
  })

  test('solde insuffisant → rejet, aucune transaction créée', async () => {
    const tx = setupTx()
    tx.account.findUnique.mockResolvedValueOnce(compteSource)
    tx.beneficiaire.findUnique.mockResolvedValueOnce(beneficiaire)
    tx.account.updateMany.mockResolvedValue({ count: 0 })

    await expect(
      service.createVirementBeneficiaireService(10, 1, 5, 999, 'Virement')
    ).rejects.toThrow('insuffisant')
    expect(tx.transaction.create).not.toHaveBeenCalled()
  })
})
