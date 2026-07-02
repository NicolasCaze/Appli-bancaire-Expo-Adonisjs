import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { router } from 'expo-router'
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

export default function TransferBeneficiaireScreen() {
    const { accounts, beneficiaires, loadAccounts, loadTransactions } = useAuth()
    const compteBancaire = accounts.find((account) => account.type === 'BANCAIRE')

    const [beneficiaireId, setBeneficiaireId] = useState<number | null>(null)
    const [montant, setMontant] = useState('')
    const [libelle, setLibelle] = useState('')
    const [loading, setLoading] = useState(false)

    const handleTransfer = async () => {
        const montantNumber = Number(montant.replace(',', '.'))

        if (!compteBancaire) {
            Alert.alert('Erreur', "Vous devez d'abord ouvrir un compte bancaire")
            return
        }
        if (!beneficiaireId) {
            Alert.alert('Erreur', 'Choisissez un bénéficiaire')
            return
        }
        if (!montantNumber || montantNumber <= 0) {
            Alert.alert('Erreur', 'Le montant doit être positif')
            return
        }

        setLoading(true)
        try {
            await transactionService.createVirementBeneficiaire(
                compteBancaire.id,
                beneficiaireId,
                montantNumber,
                libelle.trim() || 'Virement'
            )
            await Promise.all([loadAccounts(), loadTransactions()])
            Alert.alert('Virement effectué', 'Le virement a bien été envoyé', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error: any) {
            Alert.alert('Erreur', error.message || "Impossible d'effectuer le virement")
        } finally {
            setLoading(false)
        }
    }

    if (!compteBancaire) {
        return (
            <LinearGradient
                colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={styles.container}>
                    <BackHeader title="Virement vers un bénéficiaire" />
                    <Text style={styles.empty}>Vous devez d'abord ouvrir un compte bancaire pour effectuer un virement.</Text>
                </SafeAreaView>
            </LinearGradient>
        )
    }

    if (beneficiaires.length === 0) {
        return (
            <LinearGradient
                colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={styles.container}>
                    <BackHeader title="Virement vers un bénéficiaire" />
                    <Text style={styles.empty}>Vous n'avez aucun bénéficiaire enregistré.</Text>
                    <TouchableOpacity style={styles.button} onPress={() => router.push('/beneficiaires')}>
                        <Text style={styles.buttonText}>Ajouter un bénéficiaire</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>
        )
    }

    return (
        <LinearGradient
            colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.content}>
                    <BackHeader title="Virement vers un bénéficiaire" />

                    <Text style={styles.label}>Depuis</Text>
                    <View style={styles.sourceBox}>
                        <Text style={styles.optionText}>{getAccountLabel(compteBancaire.type)}</Text>
                        <Text style={styles.optionText}>{compteBancaire.solde}€</Text>
                    </View>

                    <Text style={styles.label}>Vers</Text>
                    {beneficiaires.map((beneficiaire) => (
                        <TouchableOpacity
                            key={beneficiaire.id}
                            style={[
                                styles.option,
                                beneficiaireId === beneficiaire.id && styles.optionSelected
                            ]}
                            onPress={() => setBeneficiaireId(beneficiaire.id)}
                        >
                            <Text style={styles.optionText}>{beneficiaire.nom}</Text>
                            <Text style={styles.optionSubText}>{beneficiaire.iban}</Text>
                        </TouchableOpacity>
                    ))}

                    <Text style={styles.label}>Montant</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={montant}
                        onChangeText={setMontant}
                        keyboardType="decimal-pad"
                    />

                    <Text style={styles.label}>Libellé (optionnel)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Virement"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={libelle}
                        onChangeText={setLibelle}
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleTransfer}
                        disabled={loading}
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
        flex: 1,
        padding: 20
    },
    content: {
        gap: 8,
        paddingBottom: 20
    },
    label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginTop: 12,
        marginBottom: 4
    },
    empty: {
        color: 'rgba(255,255,255,0.6)',
        fontStyle: 'italic',
        marginVertical: 20
    },
    sourceBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 14
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    optionSelected: {
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.25)'
    },
    optionText: {
        color: '#fff',
        fontWeight: '600'
    },
    optionSubText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13
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
