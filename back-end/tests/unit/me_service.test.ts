import { describe, test, expect, vi, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

const hashMock = vi.hoisted(() => ({
  default: { verify: vi.fn(), make: vi.fn() },
}))

vi.mock('../../lib/prisma.js', () => prismaMock)
vi.mock('@adonisjs/core/services/hash', () => hashMock)

import { MeService } from '../../app/service/me_service.js'

const service = new MeService()

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── getProfile ────────────────────────────────────────────────────────────

describe('getProfile', () => {
  test("retourne le profil avec l'IBAN/RIB du compte bancaire", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue({
      id: 1,
      firstname: 'Alice',
      lastname: 'Test',
      email: 'alice@example.com',
      dateNaissance: new Date('2000-01-01'),
      lieuNaissance: 'Paris',
      adresse: '1 rue de Test',
      accounts: [{ iban: 'FR76...', rib: '1234567890' }],
    })

    const result = await service.getProfile(1)

    expect(result).toMatchObject({
      id: 1,
      email: 'alice@example.com',
      iban: 'FR76...',
      rib: '1234567890',
    })
  })

  test('retourne iban/rib à null si aucun compte bancaire', async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue({
      id: 1,
      firstname: 'Alice',
      lastname: 'Test',
      email: 'alice@example.com',
      dateNaissance: new Date('2000-01-01'),
      lieuNaissance: 'Paris',
      adresse: '1 rue',
      accounts: [],
    })

    const result = await service.getProfile(1)

    expect(result.iban).toBeNull()
    expect(result.rib).toBeNull()
  })

  test("rejette si l'utilisateur est introuvable", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue(null)

    await expect(service.getProfile(999)).rejects.toThrow('introuvable')
  })
})

// ─── updateEmail ───────────────────────────────────────────────────────────

describe('updateEmail', () => {
  test("met à jour l'email si non utilisé par un autre compte", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue(null)
    prismaMock.prisma.user.update.mockResolvedValue({ id: 1, email: 'nouveau@example.com' })

    await service.updateEmail(1, 'nouveau@example.com')

    expect(prismaMock.prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { email: 'nouveau@example.com' },
    })
  })

  test('autorise à garder le même email pour soi-même', async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'alice@example.com' })
    prismaMock.prisma.user.update.mockResolvedValue({ id: 1, email: 'alice@example.com' })

    await expect(service.updateEmail(1, 'alice@example.com')).resolves.toBeDefined()
  })

  test("rejette si l'email est déjà utilisé par un autre utilisateur", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue({ id: 2, email: 'prise@example.com' })

    await expect(service.updateEmail(1, 'prise@example.com')).rejects.toThrow('déjà utilisé')
    expect(prismaMock.prisma.user.update).not.toHaveBeenCalled()
  })
})

// ─── updatePassword ────────────────────────────────────────────────────────

describe('updatePassword', () => {
  test("met à jour le mot de passe si l'ancien est correct", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashed-old' })
    hashMock.default.verify.mockResolvedValue(true)
    hashMock.default.make.mockResolvedValue('hashed-new')

    await service.updatePassword(1, 'oldPass1!', 'newPass1!')

    expect(prismaMock.prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { password: 'hashed-new' },
    })
  })

  test("rejette si l'utilisateur est introuvable", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue(null)

    await expect(service.updatePassword(999, 'a', 'b')).rejects.toThrow('introuvable')
  })

  test('rejette si le mot de passe actuel est incorrect', async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashed-old' })
    hashMock.default.verify.mockResolvedValue(false)

    await expect(service.updatePassword(1, 'wrong', 'newPass1!')).rejects.toThrow('incorrect')
    expect(prismaMock.prisma.user.update).not.toHaveBeenCalled()
  })
})
