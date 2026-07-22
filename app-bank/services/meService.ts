import api from './api'
import sessionManager from '@/utils/sessionManager'

export type UserProfile = {
    id: number
    firstname: string
    lastname: string
    email: string
    dateNaissance: string
    lieuNaissance: string
    adresse: string
    iban: string | null
    rib: string | null
}

export type Session = {
    id: number
    deviceInfo: string | null
    ipAddress: string | null
    createdAt: string
    lastUsedAt: string
}

const meService = {
    async getProfile(): Promise<UserProfile> {
        try {
            const res = await api.get('/me')
            return res.data
        } catch (error: any) {
            if (sessionManager.isSessionExpiredError(error)) {
                await sessionManager.handleSessionExpired()
                throw new Error('Votre session a expiré')
            }
            throw new Error('Erreur lors de la récupération du profil')
        }
    },

    async updateEmail(email: string): Promise<void> {
        try {
            await api.patch('/me/email', { email })
        } catch (error: any) {
            if (sessionManager.isSessionExpiredError(error)) {
                await sessionManager.handleSessionExpired()
                throw new Error('Votre session a expiré')
            }
            const msg = error.response?.data?.message
            throw new Error(msg ?? 'Erreur lors de la mise à jour de l\'email')
        }
    },

    async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
        try {
            await api.patch('/me/password', { currentPassword, newPassword })
        } catch (error: any) {
            if (sessionManager.isSessionExpiredError(error)) {
                await sessionManager.handleSessionExpired()
                throw new Error('Votre session a expiré')
            }
            const msg = error.response?.data?.message
            throw new Error(msg ?? 'Erreur lors de la mise à jour du mot de passe')
        }
    },

    async getSessions(): Promise<Session[]> {
        try {
            const res = await api.get('/me/sessions')
            return res.data
        } catch (error: any) {
            if (sessionManager.isSessionExpiredError(error)) {
                await sessionManager.handleSessionExpired()
                throw new Error('Votre session a expiré')
            }
            throw new Error('Erreur lors de la récupération des sessions')
        }
    },

    async revokeSession(id: number): Promise<void> {
        try {
            await api.delete(`/me/sessions/${id}`)
        } catch (error: any) {
            if (sessionManager.isSessionExpiredError(error)) {
                await sessionManager.handleSessionExpired()
                throw new Error('Votre session a expiré')
            }
            const msg = error.response?.data?.message
            throw new Error(msg ?? 'Erreur lors de la révocation de la session')
        }
    },
}

export default meService
