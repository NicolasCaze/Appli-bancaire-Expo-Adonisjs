import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { prisma } from '../lib/prisma.js'

export default class CleanupExpiredTokens extends BaseCommand {
  static commandName = 'cleanup:tokens'
  static description = 'Supprime les refresh tokens expirés de la base de données'

  static options: CommandOptions = {
    startApp: false, // Pas besoin de démarrer l'app complète
  }

  async run() {
    this.logger.info('🧹 Nettoyage des refresh tokens expirés...')

    try {
      // Supprimer tous les tokens où expireAt < maintenant
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expireAt: {
            lt: new Date() // lt = less than (inférieur à)
          }
        }
      })

      this.logger.success(`✅ ${result.count} token(s) expiré(s) supprimé(s)`)
    } catch (error) {
      this.logger.error('❌ Erreur lors du nettoyage')
      this.logger.error(error.message)
    }
  }
}