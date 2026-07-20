import * as Notifications from 'expo-notifications'
import * as SecureStore from 'expo-secure-store'
import type { Payment } from '@/types/auth'

const BUDGET_KEY = 'budget_mensuel'

export async function saveBudget(montant: number): Promise<void> {
  await SecureStore.setItemAsync(BUDGET_KEY, String(montant))
}

export async function getBudget(): Promise<number | null> {
  const val = await SecureStore.getItemAsync(BUDGET_KEY)
  return val ? Number(val) : null
}

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export function getTotalMois(payments: Payment[]): number {
  const now = new Date()
  return payments
    .filter((p) => {
      const d = new Date(p.datePaiement)
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear() &&
        p.statut !== 'REFUSE'
      )
    })
    .reduce((acc, p) => acc + Number(p.montant), 0)
}

export async function checkAndSchedule(payments: Payment[]): Promise<void> {
  const budget = await getBudget()
  if (!budget) return

  const total = getTotalMois(payments)
  const pourcentage = (total / budget) * 100

  await Notifications.cancelAllScheduledNotificationsAsync()

  if (pourcentage < 80) return

  const granted = await requestPermissions()
  if (!granted) return

  const depasse = pourcentage >= 100
  const titre = depasse ? '🚨 Budget dépassé — Finygo' : '⚠️ Budget du mois — Finygo'
  const corps = depasse
    ? `Vous avez dépensé ${total.toFixed(0)} € sur ${budget} € (${Math.round(pourcentage)} %). Seuil dépassé.`
    : `Vous avez dépensé ${total.toFixed(0)} € sur ${budget} € (${Math.round(pourcentage)} %). Vous approchez de votre limite.`

  await Notifications.scheduleNotificationAsync({
    content: { title: titre, body: corps, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  })
}
