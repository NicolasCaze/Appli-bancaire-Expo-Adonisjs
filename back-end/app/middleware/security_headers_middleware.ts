import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SecurityHeadersMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await next()
    ctx.response.header('X-Content-Type-Options', 'nosniff')
    ctx.response.header('X-Frame-Options', 'DENY')
    ctx.response.header('X-XSS-Protection', '1; mode=block')
    ctx.response.header('Referrer-Policy', 'no-referrer')
    ctx.response.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  }
}
