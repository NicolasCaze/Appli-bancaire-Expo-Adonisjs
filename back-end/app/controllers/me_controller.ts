import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { MeService } from '../service/me_service.js'

const updateEmailValidator = vine.compile(
    vine.object({ email: vine.string().email() })
)

const updatePasswordValidator = vine.compile(
    vine.object({
        currentPassword: vine.string().minLength(1),
        newPassword: vine
            .string()
            .minLength(8)
            .maxLength(100)
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
    })
)

export default class MeController {
    private meService: MeService

    constructor() {
        this.meService = new MeService()
    }

    public async getProfile({ user, response }: HttpContext) {
        try {
            const profile = await this.meService.getProfile(user!.userId)
            return response.status(200).json(profile)
        } catch (error: any) {
            return response.status(500).json({ message: error.message })
        }
    }

    public async updateEmail({ user, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(updateEmailValidator)
            await this.meService.updateEmail(user!.userId, payload.email)
            return response.status(200).json({ message: 'Email mis à jour' })
        } catch (error: any) {
            if (error.messages) {
                return response.status(422).json({ message: 'Données invalides', errors: error.messages })
            }
            return response.status(400).json({ message: error.message })
        }
    }

    public async updatePassword({ user, request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(updatePasswordValidator)
            await this.meService.updatePassword(user!.userId, payload.currentPassword, payload.newPassword)
            return response.status(200).json({ message: 'Mot de passe mis à jour' })
        } catch (error: any) {
            if (error.messages) {
                return response.status(422).json({ message: 'Données invalides', errors: error.messages })
            }
            return response.status(400).json({ message: error.message })
        }
    }
}
