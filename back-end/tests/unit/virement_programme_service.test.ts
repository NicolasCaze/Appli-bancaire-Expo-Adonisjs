import { describe, test, expect, vi, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => {
  const tx = {
    account: { updateMany: vi.fn() },
    transaction: { create: vi.fn() },
    virementProgramme: { update: vi.fn() },
  }
  return {
    prisma: {
      virementProgramme: {
        findMany: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      account: { findUnique: vi.fn() },
      beneficiaire: { findUnique: vi.fn() },
      $transaction: vi.fn(async (callback: any) => callback(tx)),
    },
    tx,
  }
})

vi.mock('../../lib/prisma.js', () => ({ prisma: prismaMock.prisma }))

import { virementsProgrammesService } from '../../app/service/virement_programme_service.js'

const service = new virementsProgrammesService()

const compteBancaire = { id: 1, userId: 10, type: 'BANCAIRE', solde: 500 }
const beneficiaire = { id: 5, userId: 10, nom: 'Jean Dupont' }
const demain = new Date(Date.now() + 24 * 60 * 60 * 1000)

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── getMyVirementsProgrammesService ──────────────────────────────────────

describe('getMyVirementsProgrammesService', () => {
  test("retourne les virements programmés de l'utilisateur avec le bénéficiaire", async () => {
    const virements = [{ id: 1, compteSourceId: 1, beneficiaire }]
    prismaMock.prisma.virementProgramme.findMany.mockResolvedValue(virements)

    const result = await service.getMyVirementsProgrammesService(10)

    expect(prismaMock.prisma.virementProgramme.findMany).toHaveBeenCalledWith({
      where: { compteSource: { userId: 10 } },
      include: { beneficiaire: true },
    })
    expect(result).toEqual(virements)
  })
})

// ─── createVirementProgrammeService ───────────────────────────────────────

describe('createVirementProgrammeService', () => {
  const create = () =>
    service.createVirementProgrammeService(10, 1, 5, 100, 'Loyer', 'MENSUEL', demain, null)

  test('crée un virement programmé valide', async () => {
    prismaMock.prisma.account.findUnique.mockResolvedValue(compteBancaire)
    prismaMock.prisma.beneficiaire.findUnique.mockResolvedValue(beneficiaire)
    prismaMock.prisma.virementProgramme.create.mockResolvedValue({ id: 1, statut: 'ACTIF' })

    const result = await create()

    expect(prismaMock.prisma.virementProgramme.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          compteSourceId: 1,
          beneficiaireId: 5,
          montant: 100,
          frequence: 'MENSUEL',
        }),
      })
    )
    expect(result).toMatchObject({ statut: 'ACTIF' })
  })

  test('rejette si le montant est nul ou négatif', async () => {
    await expect(
      service.createVirementProgrammeService(10, 1, 5, 0, 'x', 'MENSUEL', demain)
    ).rejects.toThrow('positif')
    await expect(
      service.createVirementProgrammeService(10, 1, 5, -10, 'x', 'MENSUEL', demain)
    ).rejects.toThrow('positif')
    expect(prismaMock.prisma.virementProgramme.create).not.toHaveBeenCalled()
  })

  test("rejette si la date d'exécution n'est pas dans le futur", async () => {
    const hier = new Date(Date.now() - 24 * 60 * 60 * 1000)

    await expect(
      service.createVirementProgrammeService(10, 1, 5, 100, 'x', 'MENSUEL', hier)
    ).rejects.toThrow('futur')
  })

  test("rejette si la date de fin précède la date d'exécution", async () => {
    const dateFinAvant = new Date(demain.getTime() - 60_000)

    await expect(
      service.createVirementProgrammeService(10, 1, 5, 100, 'x', 'MENSUEL', demain, dateFinAvant)
    ).rejects.toThrow('date de fin')
  })

  test('rejette si le compte source est introuvable', async () => {
    prismaMock.prisma.account.findUnique.mockResolvedValue(null)

    await expect(create()).rejects.toThrow('introuvable')
  })

  test('rejette si le compte source appartient à un autre utilisateur', async () => {
    prismaMock.prisma.account.findUnique.mockResolvedValue({ ...compteBancaire, userId: 999 })

    await expect(create()).rejects.toThrow('autorisé')
  })

  test("rejette si le compte source n'est pas un compte BANCAIRE", async () => {
    prismaMock.prisma.account.findUnique.mockResolvedValue({ ...compteBancaire, type: 'EPARGNE' })

    await expect(create()).rejects.toThrow('bancaire')
  })

  test('rejette si le bénéficiaire est introuvable', async () => {
    prismaMock.prisma.account.findUnique.mockResolvedValue(compteBancaire)
    prismaMock.prisma.beneficiaire.findUnique.mockResolvedValue(null)

    await expect(create()).rejects.toThrow('introuvable')
  })

  test('rejette si le bénéficiaire appartient à un autre utilisateur', async () => {
    prismaMock.prisma.account.findUnique.mockResolvedValue(compteBancaire)
    prismaMock.prisma.beneficiaire.findUnique.mockResolvedValue({ ...beneficiaire, userId: 999 })

    await expect(create()).rejects.toThrow('appartient')
  })
})

// ─── annulerVirementProgrammeService ──────────────────────────────────────

describe('annulerVirementProgrammeService', () => {
  test("annule un virement programmé appartenant à l'utilisateur", async () => {
    prismaMock.prisma.virementProgramme.findUnique.mockResolvedValue({
      id: 1,
      compteSource: compteBancaire,
    })

    await service.annulerVirementProgrammeService(10, 1)

    expect(prismaMock.prisma.virementProgramme.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statut: 'TERMINE' },
    })
  })

  test('rejette si le virement programmé est introuvable', async () => {
    prismaMock.prisma.virementProgramme.findUnique.mockResolvedValue(null)

    await expect(service.annulerVirementProgrammeService(10, 999)).rejects.toThrow('introuvable')
  })

  test('rejette si le virement programmé appartient à un autre utilisateur', async () => {
    prismaMock.prisma.virementProgramme.findUnique.mockResolvedValue({
      id: 1,
      compteSource: { ...compteBancaire, userId: 999 },
    })

    await expect(service.annulerVirementProgrammeService(10, 1)).rejects.toThrow('autorisé')
    expect(prismaMock.prisma.virementProgramme.update).not.toHaveBeenCalled()
  })
})

// ─── executerVirementsDusService ──────────────────────────────────────────

describe('executerVirementsDusService', () => {
  test('exécute un virement UNIQUE arrivé à échéance et le termine', async () => {
    prismaMock.prisma.virementProgramme.findMany.mockResolvedValue([
      {
        id: 1,
        compteSourceId: 1,
        beneficiaireId: 5,
        montant: 50,
        libelle: 'x',
        frequence: 'UNIQUE',
        dateProchaineExecution: new Date(),
        dateFin: null,
      },
    ])
    prismaMock.tx.account.updateMany.mockResolvedValue({ count: 1 })

    const result = await service.executerVirementsDusService()

    expect(prismaMock.tx.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ compteSourceId: 1, montant: 50, type: 'EXTERNAL' }),
      })
    )
    expect(prismaMock.tx.virementProgramme.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { statut: 'TERMINE' },
    })
    expect(result).toEqual({ executes: 1, echoues: 0 })
  })

  test('replanifie un virement MENSUEL sans date de fin à la prochaine échéance', async () => {
    const dateExecution = new Date('2026-01-15')
    prismaMock.prisma.virementProgramme.findMany.mockResolvedValue([
      {
        id: 2,
        compteSourceId: 1,
        beneficiaireId: 5,
        montant: 50,
        libelle: 'x',
        frequence: 'MENSUEL',
        dateProchaineExecution: dateExecution,
        dateFin: null,
      },
    ])
    prismaMock.tx.account.updateMany.mockResolvedValue({ count: 1 })

    await service.executerVirementsDusService()

    expect(prismaMock.tx.virementProgramme.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { dateProchaineExecution: new Date('2026-02-15') },
    })
  })

  test('termine un virement récurrent si la prochaine échéance dépasse la date de fin', async () => {
    const dateExecution = new Date('2026-01-15')
    const dateFin = new Date('2026-01-20')
    prismaMock.prisma.virementProgramme.findMany.mockResolvedValue([
      {
        id: 3,
        compteSourceId: 1,
        beneficiaireId: 5,
        montant: 50,
        libelle: 'x',
        frequence: 'MENSUEL',
        dateProchaineExecution: dateExecution,
        dateFin,
      },
    ])
    prismaMock.tx.account.updateMany.mockResolvedValue({ count: 1 })

    await service.executerVirementsDusService()

    expect(prismaMock.tx.virementProgramme.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { statut: 'TERMINE' },
    })
  })

  test('laisse le virement ACTIF et compte un échec si le solde est insuffisant', async () => {
    prismaMock.prisma.virementProgramme.findMany.mockResolvedValue([
      {
        id: 4,
        compteSourceId: 1,
        beneficiaireId: 5,
        montant: 999,
        libelle: 'x',
        frequence: 'MENSUEL',
        dateProchaineExecution: new Date(),
        dateFin: null,
      },
    ])
    prismaMock.tx.account.updateMany.mockResolvedValue({ count: 0 })

    const result = await service.executerVirementsDusService()

    expect(prismaMock.tx.virementProgramme.update).not.toHaveBeenCalled()
    expect(result).toEqual({ executes: 0, echoues: 1 })
  })

  test("ne fait rien si aucun virement n'est dû", async () => {
    prismaMock.prisma.virementProgramme.findMany.mockResolvedValue([])

    const result = await service.executerVirementsDusService()

    expect(result).toEqual({ executes: 0, echoues: 0 })
  })
})
