import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import logger from '@adonisjs/core/services/logger'

export default class HttpLoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const start = Date.now()

    await next()

    const duration = Date.now() - start
    const method = ctx.request.method()
    const url = ctx.request.url(true)
    const status = ctx.response.getStatus()
    const message = `${method} ${url} ${status} ${duration}ms`

    if (status >= 500) {
      logger.error({ method, url, status, duration }, message)
    } else if (status >= 400) {
      logger.warn({ method, url, status, duration }, message)
    } else {
      logger.info({ method, url, status, duration }, message)
    }
  }
}
