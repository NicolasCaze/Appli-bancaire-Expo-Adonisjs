import { defineConfig } from '@adonisjs/cors'
import env from '#start/env'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */

// L'app mobile (Expo Go / build natif) n'envoie pas d'en-tête Origin : elle n'est
// jamais concernée par cette vérification. Seuls des clients navigateur (Expo web,
// outil d'admin futur) le sont — on les restreint donc à une liste explicite plutôt
// que de refléter n'importe quelle origine.
const defaultDevOrigins = [
  'http://localhost:8081',
  'http://localhost:19006',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:19006',
]
const extraOrigins =
  env
    .get('ALLOWED_ORIGINS')
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []
const allowedOrigins = [...defaultDevOrigins, ...extraOrigins]

const corsConfig = defineConfig({
  enabled: true,
  origin: allowedOrigins,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
