import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'
import env from '#start/env'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // 1. Extraire le token du header Authorization
    const authHeader = ctx.request.header('Authorization')
    
    if (!authHeader) {
      return ctx.response.status(401).json({
        message: 'Token manquant'
      })
    }

    // 2. Extraire le token (format: "Bearer eyJhbGci...")
    const token = authHeader.replace('Bearer ', '')

    try {
      // 3. Vérifier et décoder le JWT
      const decoded = jwt.verify(token, env.get('JWT_SECRET')) as any

      // 4. Attacher les infos user au contexte
      ctx.user = {
        userId: decoded.userId,
        email: decoded.email
      }

      // 5. Continuer vers le controller
      await next()
    } catch (error) {
      // Token invalide ou expiré
      return ctx.response.status(401).json({
        message: 'Token invalide ou expiré'
      })
    }
  }
}