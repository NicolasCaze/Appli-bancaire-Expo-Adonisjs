import vine from '@vinejs/vine'

export const createVirementProgrammeValidator = vine.compile(
  vine.object({
    compteSourceId: vine.number().positive(),
    beneficiaireId: vine.number().positive(),
    montant: vine.number().positive().decimal([0, 2]),
    libelle: vine.string().trim().maxLength(255).optional(),
    frequence: vine.enum(['UNIQUE', 'QUOTIDIEN', 'HEBDOMADAIRE', 'MENSUEL'] as const),
    dateProchaineExecution: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dateFin: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()
  })
)
