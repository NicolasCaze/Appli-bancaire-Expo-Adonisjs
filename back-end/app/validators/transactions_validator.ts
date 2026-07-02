import vine from '@vinejs/vine'

export const createTransactionValidator = vine.compile(
  vine.object({
    compteSourceId: vine.number().positive(),
    compteDestinationId: vine.number().positive(),
    montant: vine.number().positive().decimal([0, 2]),
    libelle: vine.string().trim().maxLength(255).optional()
  })
)

export const createVirementBeneficiaireValidator = vine.compile(
  vine.object({
    compteSourceId: vine.number().positive(),
    beneficiaireId: vine.number().positive(),
    montant: vine.number().positive().decimal([0, 2]),
    libelle: vine.string().trim().maxLength(255).optional()
  })
)
