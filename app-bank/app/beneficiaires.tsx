import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/contexts/AuthContext'
import beneficiaireService from '@/services/beneficiaireService'
import type { Beneficiaire } from '@/types/auth'
import BackHeader from '@/components/ui/BackHeader'

export default function BeneficiairesScreen() {
    const { beneficiaires, loadBeneficiaires } = useAuth()
    const [nom, setNom] = useState('')
    const [iban, setIban] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (!nom.trim() || !iban.trim()) {
            Alert.alert('Erreur', 'Le nom et l\'IBAN sont obligatoires')
            return
        }

        setLoading(true)
        try {
            await beneficiaireService.createBeneficiaire(nom.trim(), iban.trim())
            setNom('')
            setIban('')
            await loadBeneficiaires()
        } catch (error: any) {
            Alert.alert('Erreur', error.message || "Impossible d'ajouter ce bénéficiaire")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (beneficiaire: Beneficiaire) => {
        Alert.alert(
            'Supprimer ce bénéficiaire ?',
            `${beneficiaire.nom} sera supprimé de votre liste.`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await beneficiaireService.deleteBeneficiaire(beneficiaire.id)
                            await loadBeneficiaires()
                        } catch (error: any) {
                            Alert.alert('Erreur', error.message || 'Impossible de supprimer ce bénéficiaire')
                        }
                    }
                }
            ]
        )
    }

    return (
        <LinearGradient
            colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.container}>
                <BackHeader title="Mes bénéficiaires" />

                <FlatList
                    data={beneficiaires}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>Aucun bénéficiaire enregistré</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.beneficiaireItem}>
                            <View>
                                <Text style={styles.beneficiaireNom}>{item.nom}</Text>
                                <Text style={styles.beneficiaireIban}>{item.iban}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item)}>
                                <Text style={styles.deleteText}>Supprimer</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />

                <View style={styles.form}>
                    <Text style={styles.label}>Nom du bénéficiaire</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Jean Dupont"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={nom}
                        onChangeText={setNom}
                    />

                    <Text style={styles.label}>IBAN</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={iban}
                        onChangeText={setIban}
                        autoCapitalize="characters"
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleCreate}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Ajout...' : 'Ajouter le bénéficiaire'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    list: {
        gap: 8,
        paddingBottom: 10
    },
    empty: {
        color: 'rgba(255,255,255,0.6)',
        fontStyle: 'italic',
        marginTop: 10
    },
    beneficiaireItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 14
    },
    beneficiaireNom: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16
    },
    beneficiaireIban: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginTop: 2
    },
    deleteText: {
        color: '#ff8a8a',
        fontWeight: '600'
    },
    form: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
        paddingTop: 16,
        marginTop: 10,
        gap: 8
    },
    label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginBottom: 4
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
        marginTop: 12
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
