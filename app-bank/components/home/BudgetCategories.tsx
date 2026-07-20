import { View, Text, StyleSheet } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import type { BudgetStatut } from '@/types/auth'

const COULEUR: Record<BudgetStatut, string> = {
    ok: '#22c55e',
    warning: '#f97316',
    exceeded: '#ef4444',
}

const ICONE: Record<BudgetStatut, string> = {
    ok: '✓',
    warning: '⚠',
    exceeded: '✗',
}

const LABEL: Record<BudgetStatut, string> = {
    ok: 'OK',
    warning: 'Attention',
    exceeded: 'Dépassé',
}

export default function BudgetCategories() {
    const { budgetStatut } = useAuth()

    if (budgetStatut.length === 0) return null

    const hasAlert = budgetStatut.some((b) => b.statut !== 'ok')

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <Text style={styles.title}>Budget du mois</Text>

                {hasAlert && (
                    <View
                        style={styles.banner}
                        accessibilityRole="alert"
                        accessibilityLabel="Alerte budget : une ou plusieurs catégories approchent ou dépassent leur plafond"
                    >
                        <Text style={styles.bannerText}>
                            ⚠ Une ou plusieurs catégories approchent ou dépassent leur plafond
                        </Text>
                    </View>
                )}

                {budgetStatut.map((b) => {
                    const couleur = COULEUR[b.statut]
                    const largeur = Math.min(b.pourcentage, 100)
                    const label = `${b.categorie} : ${b.cumul.toFixed(0)} euros dépensés sur ${b.plafond} euros — ${LABEL[b.statut]}`

                    return (
                        <View
                            key={b.categorie}
                            style={styles.ligne}
                            accessibilityLabel={label}
                            accessibilityRole="none"
                        >
                            <View style={styles.enTete}>
                                <Text style={styles.categorie}>{b.categorie}</Text>
                                <Text style={[styles.statut, { color: couleur }]}>
                                    {ICONE[b.statut]} {LABEL[b.statut]} — {b.cumul.toFixed(0)} / {b.plafond} €
                                </Text>
                            </View>
                            <View style={styles.barrefond}>
                                <View
                                    style={[
                                        styles.barrePleine,
                                        { width: `${largeur}%` as any, backgroundColor: couleur },
                                    ]}
                                />
                            </View>
                        </View>
                    )
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 16,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0a0a0a',
    },
    banner: {
        backgroundColor: '#fef3c7',
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#f97316',
    },
    bannerText: {
        color: '#92400e',
        fontSize: 13,
        fontWeight: '600',
    },
    ligne: {
        gap: 6,
    },
    enTete: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categorie: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0a0a0a',
    },
    statut: {
        fontSize: 12,
        fontWeight: '600',
    },
    barrefond: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barrePleine: {
        height: 8,
        borderRadius: 4,
    },
})
