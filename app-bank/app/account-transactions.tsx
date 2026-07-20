import { FontAwesome6 } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { SectionList, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/contexts/AuthContext'
import BackHeader from '@/components/ui/BackHeader'
import { formatDate } from '@/utils/dateFormatter'

const MOIS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function accountTypeLabel(type: string): string {
    switch (type) {
        case 'BANCAIRE': return 'Compte bancaire'
        case 'EPARGNE': return 'Compte épargne'
        case 'POCKET': return 'Pocket'
        default: return type
    }
}

type Item = {
    kind: 'payment' | 'transaction'
    id: number
    label: string
    date: string
    amount: number
    debit: boolean
}

type Section = { title: string; data: Item[] }

export default function AccountTransactionsScreen() {
    const { accountId: accountIdParam } = useLocalSearchParams<{ accountId: string }>()
    const accountId = Number(accountIdParam)
    const { payments, transactions, accounts, beneficiaires } = useAuth()

    const account = accounts.find(a => a.id === accountId)
    const title = account ? accountTypeLabel(account.type) : 'Transactions'

    const items: Item[] = []

    payments
        .filter(p => p.accountId === accountId)
        .forEach(p => items.push({
            kind: 'payment',
            id: p.id,
            label: p.description,
            date: p.datePaiement,
            amount: Number(p.montant),
            debit: true,
        }))

    transactions
        .filter(t =>
            (t.compteSourceId === accountId || t.compteDestinationId === accountId)
            && t.statut !== 'ECHOUÉE'
        )
        .forEach(t => {
            const isDebit = t.compteSourceId === accountId
            let label: string

            if (t.type === 'EXTERNAL') {
                const benef = beneficiaires.find(b => b.id === t.beneficiaireId)
                label = `Vers ${benef?.nom ?? 'bénéficiaire'}`
            } else if (isDebit) {
                const dest = accounts.find(a => a.id === t.compteDestinationId)
                label = dest ? `Vers ${accountTypeLabel(dest.type)}` : 'Virement sortant'
            } else {
                const src = accounts.find(a => a.id === t.compteSourceId)
                label = src ? `De ${accountTypeLabel(src.type)}` : 'Virement reçu'
            }

            items.push({
                kind: 'transaction',
                id: t.id,
                label,
                date: t.dateTransaction,
                amount: Number(t.montant),
                debit: isDebit,
            })
        })

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const monthMap = new Map<string, Section>()
    items.forEach(item => {
        const d = new Date(item.date)
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
        if (!monthMap.has(key)) {
            monthMap.set(key, { title: `${MOIS[d.getMonth()]} ${d.getFullYear()}`, data: [] })
        }
        monthMap.get(key)!.data.push(item)
    })

    const sections: Section[] = [...monthMap.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([, section]) => section)

    return (
        <LinearGradient
            colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <BackHeader title={title} />
                </View>

                {sections.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucune transaction</Text>
                    </View>
                ) : (
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => `${item.kind}-${item.id}`}
                        contentContainerStyle={styles.listContent}
                        stickySectionHeadersEnabled={false}
                        renderSectionHeader={({ section }) => (
                            <Text style={styles.monthHeader}>{section.title}</Text>
                        )}
                        renderItem={({ item, index, section }) => (
                            <View style={styles.card}>
                                <View style={styles.row}>
                                    <View style={styles.iconContainer}>
                                        {item.kind === 'payment' ? (
                                            <FontAwesome6 name="cart-shopping" size={18} color={Colors.primary} />
                                        ) : (
                                            <FontAwesome6
                                                name={item.debit ? 'arrow-right' : 'arrow-left'}
                                                size={18}
                                                color={item.debit ? '#ef4444' : '#22c55e'}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.label}>{item.label}</Text>
                                        <Text style={styles.date}>{formatDate(item.date)}</Text>
                                    </View>
                                    <Text style={[styles.amount, !item.debit && styles.amountCredit]}>
                                        {item.debit ? '-' : '+'}{item.amount}€
                                    </Text>
                                </View>
                                {index < section.data.length - 1 && <View style={styles.separator} />}
                            </View>
                        )}
                        renderSectionFooter={() => <View style={styles.sectionGap} />}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    monthHeader: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: 8,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 0,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    iconContainer: {
        backgroundColor: '#F2F2F7',
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        color: '#000',
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 2,
    },
    date: {
        color: '#8E8E93',
        fontSize: 12,
    },
    amount: {
        color: '#000',
        fontSize: 15,
        fontWeight: '600',
    },
    amountCredit: {
        color: '#22c55e',
    },
    separator: {
        height: 1,
        backgroundColor: '#F2F2F7',
    },
    sectionGap: {
        height: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontStyle: 'italic',
    },
})
