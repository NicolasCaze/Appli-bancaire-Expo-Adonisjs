import { describe, test, expect, vi, afterEach } from 'vitest'
import RateLimitMiddleware from '../../app/middleware/rate_limit_middleware.js'

const middleware = new RateLimitMiddleware()

let ipCounter = 0
const nextIp = () => `10.0.0.${++ipCounter}` // une IP différente par test pour isoler l'état du Map interne

const makeCtx = (ip: string) => {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  return {
    ctx: { request: { ip: () => ip }, response: { status } } as any,
    status,
    json,
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('RateLimitMiddleware', () => {
  test('laisse passer la première tentative pour une IP', async () => {
    const ip = nextIp()
    const { ctx } = makeCtx(ip)
    const next = vi.fn()

    await middleware.handle(ctx, next)

    expect(next).toHaveBeenCalledOnce()
  })

  test("laisse passer jusqu'à 5 tentatives dans la fenêtre d'une minute", async () => {
    const ip = nextIp()
    const next = vi.fn()

    for (let i = 0; i < 5; i++) {
      const { ctx } = makeCtx(ip)
      await middleware.handle(ctx, next)
    }

    expect(next).toHaveBeenCalledTimes(5)
  })

  test('bloque la 6e tentative avec un 429', async () => {
    const ip = nextIp()
    const next = vi.fn()

    for (let i = 0; i < 5; i++) {
      const { ctx } = makeCtx(ip)
      await middleware.handle(ctx, next)
    }

    const { ctx, status, json } = makeCtx(ip)
    await middleware.handle(ctx, next)

    expect(status).toHaveBeenCalledWith(429)
    expect(json).toHaveBeenCalledWith({
      message: 'Trop de tentatives de connexion. Réessayez dans une minute.',
    })
    expect(next).toHaveBeenCalledTimes(5) // le 6e appel n'a pas atteint next()
  })

  test('réinitialise le compteur après expiration de la fenêtre', async () => {
    const ip = nextIp()
    const next = vi.fn()
    vi.useFakeTimers()
    const start = Date.now()

    for (let i = 0; i < 5; i++) {
      const { ctx } = makeCtx(ip)
      await middleware.handle(ctx, next)
    }

    vi.setSystemTime(start + 61_000) // fenêtre d'une minute dépassée

    const { ctx } = makeCtx(ip)
    await middleware.handle(ctx, next)

    expect(next).toHaveBeenCalledTimes(6) // la 6e tentative repasse car la fenêtre a expiré
  })

  test('gère chaque IP indépendamment', async () => {
    const ipA = nextIp()
    const ipB = nextIp()
    const next = vi.fn()

    for (let i = 0; i < 5; i++) {
      const { ctx } = makeCtx(ipA)
      await middleware.handle(ctx, next)
    }

    const { ctx, status } = makeCtx(ipB)
    await middleware.handle(ctx, next)

    expect(status).not.toHaveBeenCalled() // IP B n'a pas encore atteint sa limite
    expect(next).toHaveBeenCalledTimes(6)
  })
})
