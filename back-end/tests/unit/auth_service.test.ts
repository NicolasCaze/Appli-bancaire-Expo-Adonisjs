import { describe, test, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'

const prismaMock = vi.hoisted(() => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    refreshToken: {
      count: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

const hashMock = vi.hoisted(() => ({
  default: { verify: vi.fn(), make: vi.fn() },
}))

const loggerMock = vi.hoisted(() => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('../../lib/prisma.js', () => prismaMock)
vi.mock('@adonisjs/core/services/hash', () => hashMock)
vi.mock('@adonisjs/core/services/logger', () => loggerMock)
vi.mock('#start/env', () => ({
  default: { get: vi.fn((key: string) => (key === 'JWT_SECRET' ? 'test-secret' : undefined)) },
}))

import { AuthService } from '../../app/service/auth_service.js'

const service = new AuthService()

const baseUser = {
  id: 1,
  email: 'alice@example.com',
  firstname: 'Alice',
  lastname: 'Test',
  password: 'hashed-password',
}

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.prisma.refreshToken.count.mockResolvedValue(0)
  prismaMock.prisma.refreshToken.findMany.mockResolvedValue([])
  prismaMock.prisma.refreshToken.create.mockResolvedValue({})
})

// ─── login ─────────────────────────────────────────────────────────────────

describe('login', () => {
  test('connexion réussie : retourne user + tokens, stocke le refresh token', async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue(baseUser)
    hashMock.default.verify.mockResolvedValue(true)

    const result = await service.login('alice@example.com', 'password123', 'mobile-app', '1.2.3.4')

    expect(result.user).toEqual({
      id: 1,
      email: 'alice@example.com',
      firstname: 'Alice',
      lastname: 'Test',
    })
    expect(result.tokens.accessToken).toBeTruthy()
    expect(result.tokens.refreshToken).toMatch(/^[0-9a-f]{128}$/)

    const decoded = jwt.verify(result.tokens.accessToken, 'test-secret') as any
    expect(decoded.userId).toBe(1)
    expect(decoded.email).toBe('alice@example.com')

    expect(prismaMock.prisma.refreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: result.tokens.refreshToken,
          userId: 1,
          deviceInfo: 'mobile-app',
          ipAddress: '1.2.3.4',
        }),
      })
    )
  })

  test("rejette si l'email est inconnu, sans révéler que l'utilisateur n'existe pas", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue(null)

    await expect(service.login('inconnu@example.com', 'password123')).rejects.toThrow(
      'Identifiants invalides'
    )
    expect(loggerMock.default.warn).toHaveBeenCalled()
    expect(prismaMock.prisma.refreshToken.create).not.toHaveBeenCalled()
  })

  test('rejette si le mot de passe est invalide', async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue(baseUser)
    hashMock.default.verify.mockResolvedValue(false)

    await expect(service.login('alice@example.com', 'wrong')).rejects.toThrow(
      'Identifiants invalides'
    )
    expect(loggerMock.default.warn).toHaveBeenCalled()
    expect(prismaMock.prisma.refreshToken.create).not.toHaveBeenCalled()
  })

  test('révoque les tokens les plus anciens si la limite de 5 sessions actives est atteinte', async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue(baseUser)
    hashMock.default.verify.mockResolvedValue(true)
    prismaMock.prisma.refreshToken.count.mockResolvedValue(5)
    prismaMock.prisma.refreshToken.findMany.mockResolvedValue([{ id: 42 }])

    await service.login('alice@example.com', 'password123')

    expect(prismaMock.prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [42] } },
      data: { revokedAt: expect.any(Date) },
    })
  })

  test('ne révoque rien si moins de 5 sessions actives', async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValue(baseUser)
    hashMock.default.verify.mockResolvedValue(true)
    prismaMock.prisma.refreshToken.count.mockResolvedValue(2)

    await service.login('alice@example.com', 'password123')

    expect(prismaMock.prisma.refreshToken.updateMany).not.toHaveBeenCalled()
  })
})

// ─── refresh ───────────────────────────────────────────────────────────────

describe('refresh', () => {
  const validTokenRecord = {
    id: 10,
    token: 'old-refresh-token',
    userId: 1,
    revokedAt: null,
    expireAt: new Date(Date.now() + 60_000),
    deviceInfo: 'mobile-app',
    ipAddress: '1.2.3.4',
    user: baseUser,
  }

  test('renouvelle les tokens si le refresh token est valide', async () => {
    prismaMock.prisma.refreshToken.findUnique.mockResolvedValue(validTokenRecord)

    const result = await service.refresh('old-refresh-token')

    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toMatch(/^[0-9a-f]{128}$/)
    expect(result.refreshToken).not.toBe('old-refresh-token')

    expect(prismaMock.prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { lastUsedAt: expect.any(Date), revokedAt: expect.any(Date) },
    })
    expect(prismaMock.prisma.refreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ token: result.refreshToken, userId: 1 }),
      })
    )
  })

  test('rejette si le refresh token est introuvable', async () => {
    prismaMock.prisma.refreshToken.findUnique.mockResolvedValue(null)

    await expect(service.refresh('inconnu')).rejects.toThrow('Refresh token invalide')
  })

  test('rejette et révoque toutes les sessions si le refresh token a déjà été utilisé (réutilisation détectée)', async () => {
    prismaMock.prisma.refreshToken.findUnique.mockResolvedValue({
      ...validTokenRecord,
      revokedAt: new Date(),
    })

    await expect(service.refresh('old-refresh-token')).rejects.toThrow(
      'Tentative suspecte détectée'
    )

    expect(prismaMock.prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 1, revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    })
    expect(loggerMock.default.warn).toHaveBeenCalled()
    expect(prismaMock.prisma.refreshToken.create).not.toHaveBeenCalled()
  })

  test('rejette si le refresh token est expiré', async () => {
    prismaMock.prisma.refreshToken.findUnique.mockResolvedValue({
      ...validTokenRecord,
      expireAt: new Date(Date.now() - 60_000),
    })

    await expect(service.refresh('old-refresh-token')).rejects.toThrow('Refresh token expiré')
    expect(prismaMock.prisma.refreshToken.create).not.toHaveBeenCalled()
  })
})

// ─── logout ────────────────────────────────────────────────────────────────

describe('logout', () => {
  test("révoque le refresh token s'il existe", async () => {
    prismaMock.prisma.refreshToken.findUnique.mockResolvedValue({ id: 5, token: 'abc' })

    await service.logout('abc')

    expect(prismaMock.prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { revokedAt: expect.any(Date) },
    })
  })

  test('ne fait rien si le refresh token est introuvable (logout silencieux)', async () => {
    prismaMock.prisma.refreshToken.findUnique.mockResolvedValue(null)

    await expect(service.logout('inconnu')).resolves.toBeUndefined()
    expect(prismaMock.prisma.refreshToken.update).not.toHaveBeenCalled()
  })
})
