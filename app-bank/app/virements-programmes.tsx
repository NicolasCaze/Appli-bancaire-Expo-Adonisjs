import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/contexts/AuthContext'
import virementProgrammeService from '@/services/virementProgrammeService'
import type { Frequence, VirementProgramme } from '@/types/auth'
import BackHeader from '@/components/ui/BackHeader'

const getAccountLabel = (type?: string) => {
    if (type === 'BANCAIRE') return 'Compte Bancaire'
    if (type === 'EPARGNE') return 'Compte Épargne'
    if (type === 'POCKET') return 'Pocket'
    return 'Compte'
}

const formatDateFr = (date: Date) =>
    date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const formatDateISO = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const frequenceLabel: Record<Frequence, string> = {
    UNIQUE: 'Ponctuel',
    QUOTIDIEN: 'Tous les jours',
    HEBDOMADAIRE: 'Toutes les semaines',
    MENSUEL: 'Tous les mois'
}

export default function VirementsProgrammesScreen() {
    const { accounts, beneficiaires } = useAuth()
    const compteBancaire = accounts.find((account) => account.type === 'BANCAIRE')

    const [virements, setVirements] = useState<VirementProgramme[]>([])
    const [loadingList, setLoadingList] = useState(true)

    const [beneficiaireId, setBeneficiaireId] = useState<number | null>(null)
    const [montant, setMontant] = useState('')
    const [libelle, setLibelle] = useState('')
    const [frequence, setFrequence] = useState<Frequence>('UNIQUE')
    const [dateProchaineExecution, setDateProchaineExecution] = useState<Date | null>(null)
    const [dateFin, setDateFin] = useState<Date | null>(null)
    const [showDateProchainePicker, setShowDateProchainePicker] = useState(false)
    const [showDateFinPicker, setShowDateFinPicker] = useState(false)
    const [creating, setCreating] = useState(false)

    const loadVirements = async () => {
        try {
            const data = await virementProgrammeService.getMyVirementsProgrammes()
            setVirements(data)
        } catch (error) {
            console.error(error)
            setVirements([])
        } finally {
            setLoadingList(false)
        }
    }

    useEffect(() => {
        loadVirements()
    }, [])

    const handleCreate = async () => {
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
        if (!dateProchaineExecution) {
            Alert.alert('Erreur', 'Veuillez sélectionner une date de prochaine exécution')
            return
        }

        setCreating(true)
        try {
            await virementProgrammeService.createVirementProgramme(
                compteBancaire.id,
                beneficiaireId,
                montantNumber,
                libelle.trim() || 'Virement programmé',
                frequence,
                formatDateISO(dateProchaineExecution),
                dateFin ? formatDateISO(dateFin) : null
            )
            setMontant('')
            setLibelle('')
            setDateProchaineExecution(null)
            setDateFin(null)
            await loadVirements()
            Alert.alert('Virement programmé', 'Votre virement programmé a bien été enregistré.')
        } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Impossible de créer ce virement programmé')
        } finally {
            setCreating(false)
        }
    }

    const handleCancel = (virement: VirementProgramme) => {
        Alert.alert('Annuler ce virement programmé ?', virement.libelle, [
            { text: 'Non', style: 'cancel' },
            {
                text: 'Oui, annuler',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await virementProgrammeService.annulerVirementProgramme(virement.id)
                        await loadVirements()
                    } catch (error: any) {
                        Alert.alert('Erreur', error.message || "Impossible d'annuler ce virement")
                    }
                }
            }
        ])
    }

    if (!compteBancaire) {
        return (
            <LinearGradient
                colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={styles.container}>
                    <BackHeader title="Virements programmés" />
                    <Text style={styles.empty}>Vous devez d'abord ouvrir un compte bancaire pour programmer un virement.</Text>
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
                    <BackHeader title="Virements programmés" />
                    <Text style={styles.empty}>Vous n'avez aucun bénéficiaire enregistré.</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/beneficiaires')}
                        accessibilityRole="button"
                        accessibilityLabel="Ajouter un bénéficiaire"
                        accessibilityHint="Ouvre l'écran de gestion des bénéficiaires"
                    >
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
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
              >
                <FlatList
                    data={virements}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.content}
                    ListHeaderComponent={<BackHeader title="Virements programmés" />}
                    ListEmptyComponent={!loadingList ? <Text style={styles.empty}>Aucun virement programmé</Text> : null}
                    renderItem={({ item }) => (
                        <View style={styles.virementItem}>
                            <View style={styles.virementHeader}>
                                <Text style={styles.virementNom}>{item.beneficiaire?.nom ?? 'Bénéficiaire'}</Text>
                                <Text style={styles.virementMontant}>{item.montant}€</Text>
                            </View>
                            <Text style={styles.virementDetail}>{frequenceLabel[item.frequence]} · {item.statut}</Text>
                            <Text style={styles.virementDetail}>Prochaine exécution : {item.dateProchaineExecution.slice(0, 10)}</Text>
                            {item.statut === 'ACTIF' && (
                                <TouchableOpacity
                                    onPress={() => handleCancel(item)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Annuler le virement programmé vers ${item.beneficiaire?.nom ?? 'bénéficiaire'}`}
                                    accessibilityHint="Annule ce virement programmé"
                                >
                                    <Text style={styles.cancelText}>Annuler</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    ListFooterComponent={
                        <View style={styles.form}>
                            <Text style={styles.formTitle}>Nouveau virement programmé</Text>

                            <Text style={styles.label}>Depuis</Text>
                            <View style={styles.sourceBox}>
                                <Text style={styles.optionText}>{getAccountLabel(compteBancaire.type)}</Text>
                            </View>

                            <Text style={styles.label}>Vers</Text>
                            {beneficiaires.map((beneficiaire) => (
                                <TouchableOpacity
                                    key={beneficiaire.id}
                                    style={[styles.option, beneficiaireId === beneficiaire.id && styles.optionSelected]}
                                    onPress={() => setBeneficiaireId(beneficiaire.id)}
                                    accessibilityRole="button"
                                    accessibilityLabel={beneficiaire.nom}
                                    accessibilityState={{ selected: beneficiaireId === beneficiaire.id }}
                                >
                                    <Text style={styles.optionText}>{beneficiaire.nom}</Text>
                                </TouchableOpacity>
                            ))}

                            <Text style={styles.label}>Fréquence</Text>
                            {(Object.keys(frequenceLabel) as Frequence[]).map((freq) => (
                                <TouchableOpacity
                                    key={freq}
                                    style={[styles.option, frequence === freq && styles.optionSelected]}
                                    onPress={() => setFrequence(freq)}
                                    accessibilityRole="button"
                                    accessibilityLabel={frequenceLabel[freq]}
                                    accessibilityState={{ selected: frequence === freq }}
                                >
                                    <Text style={styles.optionText}>{frequenceLabel[freq]}</Text>
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
                                accessibilityLabel="Montant du virement programmé"
                                accessibilityHint="Entrez le montant en euros"
                            />

                            <Text style={styles.label}>Libellé (optionnel)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Virement programmé"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={libelle}
                                onChangeText={setLibelle}
                                accessibilityLabel="Libellé du virement programmé"
                                accessibilityHint="Description optionnelle du virement"
                            />

                            <Text style={styles.label}>Date de la prochaine exécution</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowDateProchainePicker(true)}
                                accessibilityRole="button"
                                accessibilityLabel="Date de la prochaine exécution"
                                accessibilityHint={dateProchaineExecution ? `Date sélectionnée : ${formatDateFr(dateProchaineExecution)}. Appuyer pour modifier` : 'Appuyer pour choisir une date'}
                            >
                                <Text style={dateProchaineExecution ? styles.dateText : styles.datePlaceholder}>
                                    {dateProchaineExecution ? formatDateFr(dateProchaineExecution) : 'Choisir une date'}
                                </Text>
                            </TouchableOpacity>

                            {showDateProchainePicker && (
                                <>
                                    <DateTimePicker
                                        value={dateProchaineExecution ?? new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        themeVariant="dark"
                                        minimumDate={new Date()}
                                        onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                                            setShowDateProchainePicker(Platform.OS === 'ios')
                                            if (selectedDate) setDateProchaineExecution(selectedDate)
                                        }}
                                    />
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity style={styles.dateDoneButton} onPress={() => setShowDateProchainePicker(false)}>
                                            <Text style={styles.dateDoneText}>Valider</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}

                            {frequence !== 'UNIQUE' && (
                                <>
                                    <Text style={styles.label}>Date de fin (optionnel)</Text>
                                    <TouchableOpacity
                                        style={styles.input}
                                        onPress={() => setShowDateFinPicker(true)}
                                        accessibilityRole="button"
                                        accessibilityLabel="Date de fin du virement programmé"
                                        accessibilityHint={dateFin ? `Date sélectionnée : ${formatDateFr(dateFin)}. Appuyer pour modifier` : 'Optionnel. Appuyer pour choisir une date'}
                                    >
                                        <Text style={dateFin ? styles.dateText : styles.datePlaceholder}>
                                            {dateFin ? formatDateFr(dateFin) : 'Aucune (optionnel)'}
                                        </Text>
                                    </TouchableOpacity>

                                    {showDateFinPicker && (
                                        <>
                                            <DateTimePicker
                                                value={dateFin ?? dateProchaineExecution ?? new Date()}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        themeVariant="dark"
                                                minimumDate={dateProchaineExecution ?? new Date()}
                                                onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                                                    setShowDateFinPicker(Platform.OS === 'ios')
                                                    if (selectedDate) setDateFin(selectedDate)
                                                }}
                                            />
                                            {Platform.OS === 'ios' && (
                                                <TouchableOpacity style={styles.dateDoneButton} onPress={() => setShowDateFinPicker(false)}>
                                                    <Text style={styles.dateDoneText}>Valider</Text>
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            <TouchableOpacity
                                style={[styles.button, creating && styles.buttonDisabled]}
                                onPress={handleCreate}
                                disabled={creating}
                                accessibilityRole="button"
                                accessibilityLabel="Programmer le virement"
                                accessibilityState={{ disabled: creating }}
                            >
                                <Text style={styles.buttonText}>{creating ? 'Création...' : 'Programmer le virement'}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
              </KeyboardAvoidingView>
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
    empty: {
        color: 'rgba(255,255,255,0.6)',
        fontStyle: 'italic',
        marginVertical: 10
    },
    sourceBox: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 14
    },
    virementItem: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        gap: 4
    },
    virementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    virementNom: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16
    },
    virementMontant: {
        color: '#fff',
        fontWeight: '600'
    },
    virementDetail: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13
    },
    cancelText: {
        color: '#ff8a8a',
        fontWeight: '600',
        marginTop: 4
    },
    form: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
        paddingTop: 16,
        marginTop: 10,
        gap: 8
    },
    formTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8
    },
    label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginTop: 8,
        marginBottom: 2
    },
    option: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 6,
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
    input: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 14,
        color: '#fff',
        fontSize: 16
    },
    dateText: {
        color: '#fff',
        fontSize: 16
    },
    datePlaceholder: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16
    },
    dateDoneButton: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginTop: 6,
        alignItems: 'center'
    },
    dateDoneText: {
        color: Colors.primary,
        fontWeight: '700',
        fontSize: 15
    },
    button: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginTop: 16
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
