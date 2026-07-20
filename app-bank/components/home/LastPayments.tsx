import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { formatDate } from '@/utils/dateFormatter';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

type Props = {
    accountId?: number
}

type Item =
    | { kind: 'payment'; id: number; label: string; date: string; amount: number; debit: boolean }
    | { kind: 'transaction'; id: number; label: string; date: string; amount: number; debit: boolean }

function accountTypeLabel(type: string): string {
    switch (type) {
        case 'BANCAIRE': return 'Compte bancaire'
        case 'EPARGNE': return 'Compte épargne'
        case 'POCKET': return 'Pocket'
        default: return type
    }
}

export default function LastPayments({ accountId }: Props) {
    const { payments, transactions, accounts, beneficiaires } = useAuth()

    const items: Item[] = []

    payments
        .filter(p => !accountId || p.accountId === accountId)
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
            (accountId ? t.compteSourceId === accountId || t.compteDestinationId === accountId : true)
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

    const visible = items.slice(0, 3)

    return (
        <View style={styles.wrapper}>
            <View style={styles.whiteContainer}>
                {visible.length === 0 ? (
                    <Text style={styles.empty}>Aucune transaction récente</Text>
                ) : visible.map((item, index) => (
                    <View key={`${item.kind}-${item.id}`}>
                        <View style={styles.container}>
                            <View style={styles.iconContainer}>
                                {item.kind === 'payment' ? (
                                    <FontAwesome6 name="cart-shopping" size={20} color={Colors.primary} />
                                ) : (
                                    <FontAwesome6
                                        name={item.debit ? 'arrow-right' : 'arrow-left'}
                                        size={20}
                                        color={item.debit ? '#ef4444' : '#22c55e'}
                                    />
                                )}
                            </View>

                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{item.label}</Text>
                                <Text style={styles.date}>{formatDate(item.date)}</Text>
                            </View>

                            <Text style={[styles.amount, !item.debit && styles.amountCredit]}>
                                {item.debit ? '-' : '+'}{item.amount}€
                            </Text>
                        </View>
                        {index < visible.length - 1 && (
                            <View style={styles.separator} />
                        )}
                    </View>
                ))}

                {accountId && (
                    <TouchableOpacity
                        style={styles.seeMoreButton}
                        onPress={() => router.push({ pathname: '/account-transactions', params: { accountId: String(accountId) } })}
                        accessibilityRole="button"
                        accessibilityLabel="Voir toutes les transactions"
                        accessibilityHint="Affiche l'historique complet des transactions"
                    >
                        <Text style={styles.seeMoreText}>Voir tout</Text>
                        <FontAwesome6 name="chevron-right" size={14} color={Colors.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 16,
    },
    whiteContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    separator: {
        height: 1,
        backgroundColor: '#F2F2F7',
        marginVertical: 4,
    },
    iconContainer: {
        backgroundColor: '#F2F2F7',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#000',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    date: {
        color: '#8E8E93',
        fontSize: 12,
    },
    amount: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    amountCredit: {
        color: '#22c55e',
    },
    empty: {
        color: '#8E8E93',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 12,
    },
    seeMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        paddingVertical: 8,
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    seeMoreText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
});
