import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
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
    const [dateProchaineExecution, setDateProchaineExecution] = useState('')
    const [dateFin, setDateFin] = useState('')
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
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateProchaineExecution)) {
            Alert.alert('Erreur', 'La date doit être au format AAAA-MM-JJ')
            return
        }
        if (dateFin && !/^\d{4}-\d{2}-\d{2}$/.test(dateFin)) {
            Alert.alert('Erreur', 'La date de fin doit être au format AAAA-MM-JJ')
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
                dateProchaineExecution,
                dateFin || null
            )
            setMontant('')
            setLibelle('')
            setDateProchaineExecution('')
            setDateFin('')
            await loadVirements()
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
                                <TouchableOpacity onPress={() => handleCancel(item)}>
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
                            />

                            <Text style={styles.label}>Libellé (optionnel)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Virement programmé"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={libelle}
                                onChangeText={setLibelle}
                            />

                            <Text style={styles.label}>Date de la prochaine exécution (AAAA-MM-JJ)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2026-07-01"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={dateProchaineExecution}
                                onChangeText={setDateProchaineExecution}
                            />

                            {frequence !== 'UNIQUE' && (
                                <>
                                    <Text style={styles.label}>Date de fin (optionnel, AAAA-MM-JJ)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="2027-01-01"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={dateFin}
                                        onChangeText={setDateFin}
                                    />
                                </>
                            )}

                            <TouchableOpacity
                                style={[styles.button, creating && styles.buttonDisabled]}
                                onPress={handleCreate}
                                disabled={creating}
                            >
                                <Text style={styles.buttonText}>{creating ? 'Création...' : 'Programmer le virement'}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
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
