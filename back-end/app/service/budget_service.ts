import { prisma } from '../../lib/prisma.js'

export type BudgetStatut = 'ok' | 'warning' | 'exceeded'

export interface BudgetCategorie {
  categorie: string
  plafond: number
  cumul: number
  pourcentage: number
  statut: BudgetStatut
}

const PLAFONDS: Record<string, number> = {
  Alimentation: 400,
  Shopping: 200,
  Transport: 150,
  Loisirs: 100,
  Santé: 100,
  Autre: 200,
}

function getStatut(pourcentage: number): BudgetStatut {
  if (pourcentage >= 100) return 'exceeded'
  if (pourcentage >= 80) return 'warning'
  return 'ok'
}

export class BudgetService {
  async getBudgetStatus(userId: number): Promise<BudgetCategorie[]> {
    const now = new Date()
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1)
    const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const payments = await prisma.payment.findMany({
      where: {
        account: { userId },
        datePaiement: { gte: debutMois, lte: finMois },
        statut: { not: 'REFUSE' },
      },
      select: { montant: true, categorie: true },
    })

    const cumulParCategorie: Record<string, number> = {}
    for (const p of payments) {
      const cat = p.categorie ?? 'Autre'
      cumulParCategorie[cat] = (cumulParCategorie[cat] ?? 0) + Number(p.montant)
    }

    return Object.entries(PLAFONDS).map(([categorie, plafond]) => {
      const cumul = cumulParCategorie[categorie] ?? 0
      const pourcentage = Math.round((cumul / plafond) * 100)
      return { categorie, plafond, cumul, pourcentage, statut: getStatut(pourcentage) }
    })
  }
}
