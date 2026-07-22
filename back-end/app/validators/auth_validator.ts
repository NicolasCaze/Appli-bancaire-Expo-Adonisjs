import vine from '@vinejs/vine'

/**
 * Schéma de validation pour le login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: vine.string().minLength(1),
    deviceInfo: vine.string().optional()
  })
)

/**
 * Schéma de validation pour la création d'utilisateur
 */
export const createUserValidator = vine.compile(
  vine.object({
    firstname: vine.string().trim().minLength(2),
    lastname: vine.string().trim().minLength(2),
    email: vine.string().email().trim(),
    password: vine
      .string()
      .minLength(8)
      .maxLength(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
    dateNaissance: vine.date(),
    lieuNaissance: vine.string().trim().minLength(2),
    adresse: vine.string().trim().minLength(5)
  })
)

/**
 * Schéma de validation pour le refresh
 */
export const refreshValidator = vine.compile(
  vine.object({
    refreshToken: vine.string().minLength(1),
    deviceInfo: vine.string().optional()
  })
)

/**
 * Schéma de validation pour le logout
 */
export const logoutValidator = vine.compile(
  vine.object({
    refreshToken: vine.string().minLength(1)
  })
)