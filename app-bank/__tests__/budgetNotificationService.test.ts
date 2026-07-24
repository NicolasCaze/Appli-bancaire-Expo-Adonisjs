jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn()
}))
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily' }
}))

import * as SecureStore from 'expo-secure-store'
import * as Notifications from 'expo-notifications'
import {
  saveBudget,
  getBudget,
  requestPermissions,
  getTotalMois,
  checkAndSchedule
} from '../services/budgetNotificationService'
import type { Payment } from '../types/auth'

beforeEach(() => {
  jest.resetAllMocks()
  ;(Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(undefined)
})

const makePayment = (overrides: Partial<Payment> = {}): Payment => ({
  id: 1,
  montant: 100,
  datePaiement: new Date().toISOString(),
  description: 'Paiement',
  categorie: null,
  moyenPaiement: 'CB',
  statut: 'VALIDE',
  accountId: 1,
  ...overrides
})

describe('saveBudget / getBudget', () => {
  test('sauvegarde le budget en tant que chaîne', async () => {
    await saveBudget(500)
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('budget_mensuel', '500')
  })

  test('récupère le budget en tant que nombre', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('500')
    await expect(getBudget()).resolves.toBe(500)
  })

  test('retourne null si aucun budget sauvegardé', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null)
    await expect(getBudget()).resolves.toBeNull()
  })
})

describe('requestPermissions', () => {
  test('retourne true si la permission est accordée', async () => {
    ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
    await expect(requestPermissions()).resolves.toBe(true)
  })

  test('retourne false si la permission est refusée', async () => {
    ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })
    await expect(requestPermissions()).resolves.toBe(false)
  })
})

describe('getTotalMois', () => {
  test('additionne uniquement les paiements du mois en cours', () => {
    const now = new Date()
    const moisDernier = new Date(now.getFullYear(), now.getMonth() - 1, 15)

    const payments = [
      makePayment({ montant: 50, datePaiement: now.toISOString() }),
      makePayment({ montant: 30, datePaiement: now.toISOString() }),
      makePayment({ montant: 999, datePaiement: moisDernier.toISOString() })
    ]

    expect(getTotalMois(payments)).toBe(80)
  })

  test('exclut les paiements avec le statut REFUSE', () => {
    const now = new Date()
    const payments = [
      makePayment({ montant: 50, datePaiement: now.toISOString(), statut: 'VALIDE' }),
      makePayment({ montant: 999, datePaiement: now.toISOString(), statut: 'REFUSE' })
    ]

    expect(getTotalMois(payments)).toBe(50)
  })

  test('retourne 0 si aucun paiement', () => {
    expect(getTotalMois([])).toBe(0)
  })
})

describe('checkAndSchedule', () => {
  test('ne fait rien si aucun budget n\'est défini', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null)

    await checkAndSchedule([])

    expect(Notifications.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled()
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled()
  })

  test('annule les notifications et ne programme rien sous 80% du budget', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('1000')
    const payments = [makePayment({ montant: 700, datePaiement: new Date().toISOString() })]

    await checkAndSchedule(payments)

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled()
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled()
  })

  test('programme une alerte "approche" entre 80% et 100% si la permission est accordée', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('1000')
    ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
    const payments = [makePayment({ montant: 850, datePaiement: new Date().toISOString() })]

    await checkAndSchedule(payments)

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: expect.stringContaining('Budget du mois') })
      })
    )
  })

  test('programme une alerte "dépassé" au-delà de 100%', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('1000')
    ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
    const payments = [makePayment({ montant: 1200, datePaiement: new Date().toISOString() })]

    await checkAndSchedule(payments)

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: expect.stringContaining('Budget dépassé') })
      })
    )
  })

  test('ne programme rien si la permission de notification est refusée', async () => {
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('1000')
    ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })
    const payments = [makePayment({ montant: 1200, datePaiement: new Date().toISOString() })]

    await checkAndSchedule(payments)

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled()
  })
})
