import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 60_000
const CLEANUP_INTERVAL_MS = 5 * 60_000

const attempts = new Map<string, { count: number; resetAt: number }>()

// Purge périodique des entrées expirées : sans ça la Map grossit indéfiniment
// (une IP par tentative de login) puisqu'aucune entrée n'est jamais retirée ailleurs.
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of attempts) {
    if (now >= entry.resetAt) {
      attempts.delete(ip)
    }
  }
}, CLEANUP_INTERVAL_MS).unref()

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
