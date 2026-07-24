import { describe, test, expect, vi } from 'vitest'
import SecurityHeadersMiddleware from '../../app/middleware/security_headers_middleware.js'

const middleware = new SecurityHeadersMiddleware()

describe('SecurityHeadersMiddleware', () => {
  test('ajoute tous les en-têtes de sécurité après le passage au controller', async () => {
    const header = vi.fn()
    const ctx = { response: { header } } as any
    const next = vi.fn()

    await middleware.handle(ctx, next)

    expect(next).toHaveBeenCalledOnce()
    expect(header).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
    expect(header).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
    expect(header).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block')
    expect(header).toHaveBeenCalledWith('Referrer-Policy', 'no-referrer')
    expect(header).toHaveBeenCalledWith(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    )
  })
})
