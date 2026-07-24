import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native'
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
        const ibanSansEspaces = iban.trim().replace(/\s+/g, '').toUpperCase()

        if (!nom.trim() || !ibanSansEspaces) {
            Alert.alert('Erreur', 'Le nom et l\'IBAN sont obligatoires')
            return
        }

        setLoading(true)
        try {
            await beneficiaireService.createBeneficiaire(nom.trim(), ibanSansEspaces)
            setNom('')
            setIban('')
            await loadBeneficiaires()
            Alert.alert('Bénéficiaire ajouté', `${nom.trim()} a bien été ajouté à vos bénéficiaires.`)
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
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
              >
                <BackHeader title="Mes bénéficiaires" />

                <FlatList
                    data={beneficiaires}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>Aucun bénéficiaire enregistré</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.beneficiaireItem} accessibilityRole="none">
                            <View>
                                <Text style={styles.beneficiaireNom}>{item.nom}</Text>
                                <Text style={styles.beneficiaireIban} accessibilityLabel={`IBAN : ${item.iban}`}>{item.iban}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleDelete(item)}
                                accessibilityRole="button"
                                accessibilityLabel={`Supprimer ${item.nom}`}
                                accessibilityHint="Supprime ce bénéficiaire de votre liste"
                            >
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
                        accessibilityLabel="Nom du bénéficiaire"
                        accessibilityHint="Entrez le nom complet du bénéficiaire"
                    />

                    <Text style={styles.label}>IBAN</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="FR76XXXXXXXXXXXXXXXXXXXXXXX"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={iban}
                        onChangeText={setIban}
                        autoCapitalize="characters"
                        accessibilityLabel="IBAN du bénéficiaire"
                        accessibilityHint="Entrez le numéro IBAN du bénéficiaire"
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleCreate}
                        disabled={loading}
                        accessibilityRole="button"
                        accessibilityLabel="Ajouter le bénéficiaire"
                        accessibilityState={{ disabled: loading }}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Ajout...' : 'Ajouter le bénéficiaire'}</Text>
                    </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
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
