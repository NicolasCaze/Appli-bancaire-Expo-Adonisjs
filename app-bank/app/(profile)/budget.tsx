import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/contexts/AuthContext'
import {
    getBudget,
    saveBudget,
    getTotalMois,
    checkAndSchedule,
} from '@/services/budgetNotificationService'
import BackHeader from '@/components/ui/BackHeader'

export default function BudgetScreen() {
    const { payments } = useAuth()
    const [budgetActuel, setBudgetActuel] = useState<number | null>(null)
    const [saisie, setSaisie] = useState('')
    const [loading, setLoading] = useState(false)

    const totalMois = getTotalMois(payments)

    useEffect(() => {
        getBudget().then((val) => {
            if (val) {
                setBudgetActuel(val)
                setSaisie(String(val))
            }
        })
    }, [])

    const handleSave = async () => {
        const montant = Number(saisie.replace(',', '.'))
        if (!montant || montant <= 0) {
            Alert.alert('Erreur', 'Veuillez saisir un montant positif')
            return
        }
        setLoading(true)
        try {
            await saveBudget(montant)
            setBudgetActuel(montant)
            await checkAndSchedule(payments)
            Alert.alert('Budget enregistré', `Votre budget mensuel est fixé à ${montant} €. Vous recevrez une notification si vous atteignez 80 % de ce seuil.`)
        } catch (error) {
            Alert.alert('Erreur', 'Impossible d\'enregistrer le budget')
        } finally {
            setLoading(false)
        }
    }

    const pourcentage = budgetActuel ? Math.round((totalMois / budgetActuel) * 100) : null
    const couleurBarre = pourcentage === null ? '#22c55e'
        : pourcentage >= 100 ? '#ef4444'
        : pourcentage >= 80 ? '#f97316'
        : '#22c55e'

    return (
        <LinearGradient
            colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.container}>
                <BackHeader title="Mon budget mensuel" />

                {/* Résumé du mois */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Dépenses ce mois-ci</Text>
                    <Text
                        style={styles.totalText}
                        accessibilityLabel={`Total dépensé ce mois : ${totalMois.toFixed(0)} euros`}
                    >
                        {totalMois.toFixed(0)} €
                    </Text>

                    {budgetActuel && pourcentage !== null && (
                        <>
                            <View style={styles.barrefond}>
                                <View
                                    style={[
                                        styles.barrePleine,
                                        {
                                            width: `${Math.min(pourcentage, 100)}%` as any,
                                            backgroundColor: couleurBarre,
                                        },
                                    ]}
                                />
                            </View>
                            <Text
                                style={[styles.pourcentageText, { color: couleurBarre }]}
                                accessibilityLabel={`${pourcentage} pourcent du budget de ${budgetActuel} euros atteint`}
                            >
                                {pourcentage} % de {budgetActuel} €
                                {pourcentage >= 100 ? '  🚨 Dépassé' : pourcentage >= 80 ? '  ⚠️ Attention' : '  ✓ OK'}
                            </Text>
                        </>
                    )}
                </View>

                {/* Formulaire */}
                <View style={styles.form}>
                    <Text style={styles.label}>Définir mon budget mensuel (€)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex : 400"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={saisie}
                        onChangeText={setSaisie}
                        keyboardType="decimal-pad"
                        accessibilityLabel="Budget mensuel en euros"
                        accessibilityHint="Entrez le montant maximum que vous souhaitez dépenser par mois"
                    />
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                        accessibilityRole="button"
                        accessibilityLabel="Enregistrer le budget"
                        accessibilityState={{ disabled: loading }}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.info}>
                    Vous recevrez une notification quotidienne à 9h si vos dépenses atteignent 80 % ou plus de votre budget.
                </Text>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 20,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 20,
        gap: 12,
    },
    cardTitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    totalText: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '700',
    },
    barrefond: {
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    barrePleine: {
        height: 10,
        borderRadius: 5,
    },
    pourcentageText: {
        fontSize: 14,
        fontWeight: '600',
    },
    form: {
        gap: 10,
    },
    label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 14,
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginTop: 4,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '700',
        color: Colors.primary,
    },
    info: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
})
