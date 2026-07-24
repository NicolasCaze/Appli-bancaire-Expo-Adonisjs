import { describe, test, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'

vi.mock('#start/env', () => ({
  default: { get: vi.fn(() => 'test-secret') },
}))

import AuthMiddleware from '../../app/middleware/auth_middleware.js'

const middleware = new AuthMiddleware()

const makeCtx = (authHeader?: string) => {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  return {
    ctx: {
      request: { header: vi.fn(() => authHeader) },
      response: { status },
      user: undefined as any,
    } as any,
    status,
    json,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthMiddleware', () => {
  test('rejette avec 401 si le header Authorization est absent', async () => {
    const { ctx, status, json } = makeCtx(undefined)
    const next = vi.fn()

    await middleware.handle(ctx, next)

    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ message: 'Token manquant' })
    expect(next).not.toHaveBeenCalled()
  })

  test('rejette avec 401 si le token est invalide', async () => {
    const { ctx, status, json } = makeCtx('Bearer token-invalide')
    const next = vi.fn()

    await middleware.handle(ctx, next)

    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ message: 'Token invalide ou expiré' })
    expect(next).not.toHaveBeenCalled()
  })

  test('rejette avec 401 si le token est expiré', async () => {
    const expiredToken = jwt.sign({ userId: 1, email: 'a@a.com' }, 'test-secret', {
      expiresIn: -10,
    })
    const { ctx, status } = makeCtx(`Bearer ${expiredToken}`)
    const next = vi.fn()

    await middleware.handle(ctx, next)

    expect(status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('attache userId/email au contexte et laisse passer si le token est valide', async () => {
    const validToken = jwt.sign({ userId: 42, email: 'alice@example.com' }, 'test-secret', {
      expiresIn: '15m',
    })
    const { ctx } = makeCtx(`Bearer ${validToken}`)
    const next = vi.fn()

    await middleware.handle(ctx, next)

    expect(ctx.user).toEqual({ userId: 42, email: 'alice@example.com' })
    expect(next).toHaveBeenCalledOnce()
  })
})
