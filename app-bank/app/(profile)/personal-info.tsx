import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator, Alert, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import BackHeader from '@/components/ui/BackHeader'
import meService, { UserProfile } from '@/services/meService'

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    )
}

export default function PersonalInfoScreen() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    const [editingEmail, setEditingEmail] = useState(false)
    const [newEmail, setNewEmail] = useState('')
    const [savingEmail, setSavingEmail] = useState(false)

    const [editingPassword, setEditingPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [savingPassword, setSavingPassword] = useState(false)

    useEffect(() => {
        meService.getProfile()
            .then(setProfile)
            .catch(() => Alert.alert('Erreur', 'Impossible de charger le profil'))
            .finally(() => setLoading(false))
    }, [])

    const handleSaveEmail = async () => {
        if (!newEmail.trim()) return
        setSavingEmail(true)
        try {
            await meService.updateEmail(newEmail.trim())
            setProfile(p => p ? { ...p, email: newEmail.trim() } : p)
            setEditingEmail(false)
            Alert.alert('Succès', 'Email mis à jour')
        } catch (e: any) {
            Alert.alert('Erreur', e.message)
        } finally {
            setSavingEmail(false)
        }
    }

    const handleSavePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas')
            return
        }
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
        if (!passwordPolicy.test(newPassword)) {
            Alert.alert(
                'Erreur',
                'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial'
            )
            return
        }
        setSavingPassword(true)
        try {
            await meService.updatePassword(currentPassword, newPassword)
            setEditingPassword(false)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            Alert.alert('Succès', 'Mot de passe mis à jour')
        } catch (e: any) {
            Alert.alert('Erreur', e.message)
        } finally {
            setSavingPassword(false)
        }
    }

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    }

    return (
        <LinearGradient
            colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerPadding}>
                    <BackHeader title="Informations personnelles" />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                ) : !profile ? null : (
                    <ScrollView contentContainerStyle={styles.content}>

                        {/* Identité */}
                        <Text style={styles.sectionTitle}>Identité</Text>
                        <View style={styles.card}>
                            <InfoRow label="Prénom" value={profile.firstname} />
                            <View style={styles.separator} />
                            <InfoRow label="Nom" value={profile.lastname} />
                            <View style={styles.separator} />
                            <InfoRow label="Date de naissance" value={formatDate(profile.dateNaissance)} />
                            <View style={styles.separator} />
                            <InfoRow label="Lieu de naissance" value={profile.lieuNaissance} />
                            <View style={styles.separator} />
                            <InfoRow label="Adresse" value={profile.adresse} />
                        </View>

                        {/* Coordonnées bancaires */}
                        {profile.iban && (
                            <>
                                <Text style={styles.sectionTitle}>Coordonnées bancaires</Text>
                                <View style={styles.card}>
                                    <View style={styles.ibanRow}>
                                        <Text style={styles.infoLabel}>IBAN</Text>
                                        <TouchableOpacity
                                            onPress={async () => {
                                                await Clipboard.setStringAsync(profile.iban!)
                                                Alert.alert('Copié', 'IBAN copié dans le presse-papier')
                                            }}
                                            accessibilityRole="button"
                                            accessibilityLabel="Copier l'IBAN"
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Ionicons name="copy-outline" size={18} color={Colors.primary} />
                                        </TouchableOpacity>
                                        <Text style={styles.ibanValue}>{profile.iban}</Text>
                                    </View>
                                    {profile.rib && (
                                        <>
                                            <View style={styles.separator} />
                                            <InfoRow label="RIB" value={profile.rib} />
                                        </>
                                    )}
                                </View>
                            </>
                        )}

                        {/* Connexion — Email */}
                        <Text style={styles.sectionTitle}>Connexion</Text>
                        <View style={styles.card}>
                            {!editingEmail ? (
                                <View style={styles.editableRow}>
                                    <View style={styles.editableText}>
                                        <Text style={styles.infoLabel}>Email</Text>
                                        <Text style={styles.infoValue}>{profile.email}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => { setNewEmail(profile.email); setEditingEmail(true) }}
                                        accessibilityRole="button"
                                        accessibilityLabel="Modifier l'email"
                                    >
                                        <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.editForm}>
                                    <Text style={styles.infoLabel}>Nouvel email</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newEmail}
                                        onChangeText={setNewEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoFocus
                                        accessibilityLabel="Nouvel email"
                                    />
                                    <View style={styles.editActions}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => setEditingEmail(false)}
                                        >
                                            <Text style={styles.cancelText}>Annuler</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.saveButton}
                                            onPress={handleSaveEmail}
                                            disabled={savingEmail}
                                        >
                                            {savingEmail
                                                ? <ActivityIndicator size="small" color="#fff" />
                                                : <Text style={styles.saveText}>Enregistrer</Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            <View style={styles.separator} />

                            {/* Mot de passe */}
                            {!editingPassword ? (
                                <View style={styles.editableRow}>
                                    <View style={styles.editableText}>
                                        <Text style={styles.infoLabel}>Mot de passe</Text>
                                        <Text style={styles.infoValue}>••••••••</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setEditingPassword(true)}
                                        accessibilityRole="button"
                                        accessibilityLabel="Modifier le mot de passe"
                                    >
                                        <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.editForm}>
                                    <Text style={styles.infoLabel}>Mot de passe actuel</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        secureTextEntry
                                        autoFocus
                                        accessibilityLabel="Mot de passe actuel"
                                    />
                                    <Text style={[styles.infoLabel, { marginTop: 10 }]}>Nouveau mot de passe</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry
                                        accessibilityLabel="Nouveau mot de passe"
                                    />
                                    <Text style={[styles.infoLabel, { marginTop: 10 }]}>Confirmer</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                        accessibilityLabel="Confirmer le nouveau mot de passe"
                                    />
                                    <View style={styles.editActions}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => {
                                                setEditingPassword(false)
                                                setCurrentPassword('')
                                                setNewPassword('')
                                                setConfirmPassword('')
                                            }}
                                        >
                                            <Text style={styles.cancelText}>Annuler</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.saveButton}
                                            onPress={handleSavePassword}
                                            disabled={savingPassword}
                                        >
                                            {savingPassword
                                                ? <ActivityIndicator size="small" color="#fff" />
                                                : <Text style={styles.saveText}>Enregistrer</Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>

                    </ScrollView>
                )}
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    headerPadding: { paddingHorizontal: 20, paddingTop: 8 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { paddingHorizontal: 16, paddingBottom: 40, gap: 8 },
    sectionTitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: 16,
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    infoLabel: {
        color: '#8E8E93',
        fontSize: 13,
        flex: 1,
    },
    infoValue: {
        color: '#000',
        fontSize: 14,
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    separator: {
        height: 1,
        backgroundColor: '#F2F2F7',
    },
    editableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    editableText: { flex: 1 },
    ibanRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 6,
    },
    ibanValue: {
        color: '#000',
        fontSize: 14,
        fontWeight: '500',
        flexShrink: 1,
    },
    editForm: {
        paddingVertical: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        marginTop: 6,
        color: '#000',
        backgroundColor: '#FAFAFA',
    },
    editActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
        justifyContent: 'flex-end',
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cancelText: {
        color: '#555',
        fontSize: 14,
    },
    saveButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: Colors.primary,
        minWidth: 100,
        alignItems: 'center',
    },
    saveText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
})
