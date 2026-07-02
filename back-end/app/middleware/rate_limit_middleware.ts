import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 60_000

const attempts = new Map<string, { count: number; resetAt: number }>()

export default class RateLimitMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const ip = ctx.request.ip()
    const now = Date.now()
    const entry = attempts.get(ip)

    if (entry && now < entry.resetAt) {
      if (entry.count >= MAX_ATTEMPTS) {
        return ctx.response.status(429).json({
          message: 'Trop de tentatives de connexion. Réessayez dans une minute.'
        })
      }
      entry.count++
    } else {
      attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    }

    await next()
  }
}
