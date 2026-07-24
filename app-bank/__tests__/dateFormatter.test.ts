import { formatDate } from '@/utils/dateFormatter'

describe('formatDate', () => {
  test('formate une date ISO en JJ/MM/AAAA', () => {
    expect(formatDate('2026-01-29T00:00:00.000Z')).toBe('29/01/2026')
  })

  test('ajoute un zéro devant le jour et le mois si nécessaire', () => {
    expect(formatDate('2026-03-05T12:00:00.000Z')).toBe('05/03/2026')
  })
})
