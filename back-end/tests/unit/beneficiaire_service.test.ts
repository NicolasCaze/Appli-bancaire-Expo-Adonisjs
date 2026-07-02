import { describe, test, expect, vi, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  prisma: {
    beneficiaire: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn()
    }
  }
}))

vi.mock('../../lib/prisma.js', () => prismaMock)

import { beneficiairesService } from '../../app/service/beneficiaire_service.js'

const service = new beneficiairesService()

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── getMyBeneficiairesService ────────────────────────────────────────────────

describe('getMyBeneficiairesService', () => {
  test('retourne la liste des bénéficiaires de l\'utilisateur', async () => {
    const beneficiaires = [
      { id: 1, userId: 10, nom: 'Jean Dupont', iban: 'FR7630004028379876543210943' }
    ]
    prismaMock.prisma.beneficiaire.findMany.mockResolvedValue(beneficiaires)

    const result = await service.getMyBeneficiairesService(10)

    expect(prismaMock.prisma.beneficiaire.findMany).toHaveBeenCalledWith({ where: { userId: 10 } })
    expect(result).toEqual(beneficiaires)
  })
})

// ─── createBeneficiaireService ────────────────────────────────────────────────

describe('createBeneficiaireService', () => {
  test('crée un bénéficiaire valide', async () => {
    prismaMock.prisma.beneficiaire.findFirst.mockResolvedValue(null)
    prismaMock.prisma.beneficiaire.create.mockResolvedValue({
      id: 1, userId: 10, nom: 'Jean Dupont', iban: 'FR7630004028379876543210943'
    })

    const result = await service.createBeneficiaireService(10, 'Jean Dupont', 'FR7630004028379876543210943')

    expect(prismaMock.prisma.beneficiaire.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 10, nom: 'Jean Dupont' }) })
    )
    expect(result).toMatchObject({ nom: 'Jean Dupont' })
  })

  test('rejette si le nom est vide', async () => {
    await expect(service.createBeneficiaireService(10, '', 'FR76300040283798')).rejects.toThrow('nom')
    expect(prismaMock.prisma.beneficiaire.create).not.toHaveBeenCalled()
  })

  test('rejette si l\'IBAN est vide', async () => {
    await expect(service.createBeneficiaireService(10, 'Jean', '')).rejects.toThrow('IBAN')
    expect(prismaMock.prisma.beneficiaire.create).not.toHaveBeenCalled()
  })

  test('rejette si le bénéficiaire existe déjà (même IBAN)', async () => {
    prismaMock.prisma.beneficiaire.findFirst.mockResolvedValue({
      id: 1, userId: 10, nom: 'Jean Dupont', iban: 'FR7630004028379876543210943'
    })

    await expect(
      service.createBeneficiaireService(10, 'Jean Dupont', 'FR7630004028379876543210943')
    ).rejects.toThrow('existe déjà')
    expect(prismaMock.prisma.beneficiaire.create).not.toHaveBeenCalled()
  })
})

// ─── deleteBeneficiaireService ────────────────────────────────────────────────

describe('deleteBeneficiaireService', () => {
  test('supprime un bénéficiaire appartenant à l\'utilisateur', async () => {
    prismaMock.prisma.beneficiaire.findUnique.mockResolvedValue({ id: 1, userId: 10, nom: 'Jean' })
    prismaMock.prisma.beneficiaire.delete.mockResolvedValue({})

    await service.deleteBeneficiaireService(10, 1)

    expect(prismaMock.prisma.beneficiaire.delete).toHaveBeenCalledWith({ where: { id: 1 } })
  })

  test('rejette si le bénéficiaire est introuvable', async () => {
    prismaMock.prisma.beneficiaire.findUnique.mockResolvedValue(null)

    await expect(service.deleteBeneficiaireService(10, 999)).rejects.toThrow('introuvable')
    expect(prismaMock.prisma.beneficiaire.delete).not.toHaveBeenCalled()
  })

  test('rejette si le bénéficiaire appartient à un autre utilisateur → erreur 403', async () => {
    prismaMock.prisma.beneficiaire.findUnique.mockResolvedValue({ id: 1, userId: 99, nom: 'Autre' })

    await expect(service.deleteBeneficiaireService(10, 1)).rejects.toThrow('autorisé')
    expect(prismaMock.prisma.beneficiaire.delete).not.toHaveBeenCalled()
  })
})
