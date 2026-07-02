import vine from '@vinejs/vine'

export const createBeneficiaireValidator = vine.compile(
  vine.object({
    nom: vine.string().trim().minLength(2).maxLength(100),
    iban: vine.string().trim().minLength(15).maxLength(34).regex(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/)
  })
)
