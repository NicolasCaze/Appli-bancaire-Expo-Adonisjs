import vine from '@vinejs/vine'

export const createAccountValidator = vine.compile(
  vine.object({
    type: vine.enum(['BANCAIRE', 'EPARGNE', 'POCKET'] as const)
  })
)
