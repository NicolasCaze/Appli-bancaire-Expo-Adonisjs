import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    const httpError = error as any

    // En production, masquer les détails des erreurs internes (5xx)
    if (app.inProduction && (!httpError.status || httpError.status >= 500)) {
      return ctx.response.status(500).json({
        message: 'Une erreur interne est survenue'
      })
    }

    return super.handle(error, ctx)
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
