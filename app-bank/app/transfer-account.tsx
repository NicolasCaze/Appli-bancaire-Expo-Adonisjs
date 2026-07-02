import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/contexts/AuthContext'
import transactionService from '@/services/transactionService'
import BackHeader from '@/components/ui/BackHeader'

const getAccountLabel = (type?: string) => {
    if (type === 'BANCAIRE') return 'Compte Bancaire'
    if (type === 'EPARGNE') return 'Compte Épargne'
    if (type === 'POCKET') return 'Pocket'
    return 'Compte'
}

export default function TransferAccountScreen() {
    const { accountId } = useLocalSearchParams<{ accountId: string }>()
    const { accounts, loadAccounts } = useAuth()

    const compteSource = accounts.find((account) => account.id === Number(accountId))
    const autresComptes = accounts.filter((account) => account.id !== Number(accountId))

    const [compteDestinationId, setCompteDestinationId] = useState<number | null>(null)
    const [montant, setMontant] = useState('')
    const [libelle, setLibelle] = useState('')
    const [loading, setLoading] = useState(false)

    const handleTransfer = async () => {
        const montantNumber = Number(montant.replace(',', '.'))

        if (!compteDestinationId) {
            Alert.alert('Erreur', 'Choisissez un compte de destination')
            return
        }
        if (!montantNumber || montantNumber <= 0) {
            Alert.alert('Erreur', 'Le montant doit être positif')
            return
        }

        setLoading(true)
        try {
            await transactionService.createInternalTransfer(
                Number(accountId),
                compteDestinationId,
                montantNumber,
                libelle.trim() || 'Virement entre comptes'
            )
            await loadAccounts()
            Alert.alert('Virement effectué', 'Le virement a bien été effectué', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Impossible d\'effectuer le virement')
        } finally {
            setLoading(false)
        }
    }

    return (
        <LinearGradient
            colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.content}>
                    <BackHeader title="Virement vers un de mes comptes" />

                    <Text style={styles.label}>Depuis</Text>
                    <View style={styles.sourceBox}>
                        <Text style={styles.sourceText}>{getAccountLabel(compteSource?.type)}</Text>
                        <Text style={styles.sourceSolde}>{compteSource?.solde}€</Text>
                    </View>

                    <Text style={styles.label}>Vers</Text>
                    {autresComptes.length === 0 ? (
                        <Text style={styles.empty}>Vous n'avez pas d'autre compte ouvert</Text>
                    ) : (
                        autresComptes.map((account) => (
                            <TouchableOpacity
                                key={account.id}
                                style={[
                                    styles.destinationOption,
                                    compteDestinationId === account.id && styles.destinationOptionSelected
                                ]}
                                onPress={() => setCompteDestinationId(account.id)}
                                accessibilityRole="button"
                                accessibilityLabel={`${getAccountLabel(account.type)}, solde : ${account.solde} euros`}
                                accessibilityState={{ selected: compteDestinationId === account.id }}
                            >
                                <Text style={styles.destinationText}>{getAccountLabel(account.type)}</Text>
                                <Text style={styles.destinationSolde}>{account.solde}€</Text>
                            </TouchableOpacity>
                        ))
                    )}

                    <Text style={styles.label}>Montant</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={montant}
                        onChangeText={setMontant}
                        keyboardType="decimal-pad"
                        accessibilityLabel="Montant du virement"
                        accessibilityHint="Entrez le montant en euros"
                    />

                    <Text style={styles.label}>Libellé (optionnel)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Virement entre comptes"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={libelle}
                        onChangeText={setLibelle}
                        accessibilityLabel="Libellé du virement"
                        accessibilityHint="Description optionnelle du virement"
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleTransfer}
                        disabled={loading}
                        accessibilityRole="button"
                        accessibilityLabel="Valider le virement"
                        accessibilityState={{ disabled: loading }}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Envoi...' : 'Valider le virement'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        padding: 20,
        gap: 8
    },
    label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginTop: 12,
        marginBottom: 4
    },
    empty: {
        color: 'rgba(255,255,255,0.6)',
        fontStyle: 'italic'
    },
    sourceBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 14
    },
    sourceText: {
        color: '#fff',
        fontWeight: '600'
    },
    sourceSolde: {
        color: '#fff'
    },
    destinationOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    destinationOptionSelected: {
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.25)'
    },
    destinationText: {
        color: '#fff',
        fontWeight: '600'
    },
    destinationSolde: {
        color: '#fff'
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 14,
        color: '#fff',
        fontSize: 16
    },
    button: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginTop: 24
    },
    buttonDisabled: {
        opacity: 0.5
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '700',
        color: Colors.primary
    }
})
