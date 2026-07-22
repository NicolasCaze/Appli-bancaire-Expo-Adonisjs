import { Ionicons } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import {
    ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import BackHeader from '@/components/ui/BackHeader'
import meService, { Session } from '@/services/meService'

const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('fr-FR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
}

function SessionRow({ session, onRevoke }: { session: Session; onRevoke: (id: number) => void }) {
    const device = session.deviceInfo ?? 'Appareil inconnu'

    const confirmRevoke = () => {
        Alert.alert(
            'Déconnecter cet appareil ?',
            `${device} devra se reconnecter avec son mot de passe.`,
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Déconnecter', style: 'destructive', onPress: () => onRevoke(session.id) },
            ]
        )
    }

    return (
        <View style={styles.row}>
            <View style={styles.rowIcon}>
                <Ionicons name="phone-portrait-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.rowInfo}>
                <Text style={styles.rowDevice}>{device}</Text>
                <Text style={styles.rowMeta}>
                    {session.ipAddress ?? 'IP inconnue'} · dernière activité le {formatDateTime(session.lastUsedAt)}
                </Text>
            </View>
            <TouchableOpacity
                onPress={confirmRevoke}
                style={styles.revokeButton}
                accessibilityRole="button"
                accessibilityLabel={`Déconnecter la session ${device}`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Ionicons name="log-out-outline" size={20} color="#ff4d4d" />
            </TouchableOpacity>
        </View>
    )
}

export default function SessionsScreen() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)

    const loadSessions = useCallback(() => {
        setLoading(true)
        meService.getSessions()
            .then(setSessions)
            .catch(() => Alert.alert('Erreur', 'Impossible de charger les sessions actives'))
            .finally(() => setLoading(false))
    }, [])

    useFocusEffect(useCallback(() => {
        loadSessions()
    }, [loadSessions]))

    const handleRevoke = async (id: number) => {
        try {
            await meService.revokeSession(id)
            setSessions(prev => prev.filter(s => s.id !== id))
        } catch (e: any) {
            Alert.alert('Erreur', e.message)
        }
    }

    return (
        <LinearGradient
            colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerPadding}>
                    <BackHeader title="Sessions actives" />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                ) : sessions.length === 0 ? (
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>Aucune session active</Text>
                    </View>
                ) : (
                    <FlatList
                        contentContainerStyle={styles.content}
                        data={sessions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <SessionRow session={item} onRevoke={handleRevoke} />}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    headerPadding: { paddingHorizontal: 20, paddingTop: 8 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
    content: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        gap: 12,
    },
    rowIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowInfo: { flex: 1 },
    rowDevice: { color: '#000', fontSize: 14, fontWeight: '600' },
    rowMeta: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
    revokeButton: { padding: 4 },
})
