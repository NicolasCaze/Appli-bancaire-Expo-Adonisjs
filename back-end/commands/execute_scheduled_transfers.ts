import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { virementsProgrammesService } from '../app/service/virement_programme_service.js'

export default class ExecuteScheduledTransfers extends BaseCommand {
  static commandName = 'transfers:execute'
  static description = 'Exécute les virements programmés arrivés à échéance'

  static options: CommandOptions = {
    startApp: false,
  }

  async run() {
    this.logger.info('💸 Exécution des virements programmés dus...')

    try {
      const service = new virementsProgrammesService()
      const resultats = await service.executerVirementsDusService()

      this.logger.success(`✅ ${resultats.executes} virement(s) exécuté(s)`)
      if (resultats.echoues > 0) {
        this.logger.warning(`⚠️ ${resultats.echoues} virement(s) en échec (solde insuffisant), retentés au prochain passage`)
      }
    } catch (error: any) {
      this.logger.error('❌ Erreur lors de l\'exécution des virements programmés')
      this.logger.error(error.message)
    }
  }
}
