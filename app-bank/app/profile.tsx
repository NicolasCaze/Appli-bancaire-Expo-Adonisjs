import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";


export default function profilePage() {
    const { user, logout } = useAuth();
    return (
            <LinearGradient
              colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
              style={{ flex: 1 }}
            >
    <SafeAreaView style={styles.bodyhome}>
        <View style={styles.backHeader}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Retour"
                accessibilityHint="Revenir à l'écran précédent"
            >
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
        </View>
        <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.firstname} {user?.lastname}</Text>
        </View>
        <View style={styles.buttonInfo}>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/(profile)/personal-info')}
                accessibilityRole="button"
                accessibilityLabel="Informations personnelles"
                accessibilityHint="Ouvre la page de vos informations personnelles"
            >
                <Text style={styles.menuText}>Informations personnelles</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/(profile)/budget')}
                accessibilityRole="button"
                accessibilityLabel="Mon budget mensuel"
                accessibilityHint="Définir un budget mensuel et activer les alertes"
            >
                <Text style={styles.menuText}>Mon budget mensuel</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/(profile)/sessions')}
                accessibilityRole="button"
                accessibilityLabel="Sessions actives"
                accessibilityHint="Voir et déconnecter les appareils connectés à votre compte"
            >
                <Text style={styles.menuText}>Sessions actives</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
            accessibilityRole="button"
            accessibilityLabel="Déconnexion"
            accessibilityHint="Vous déconnecte et revient à l'écran de connexion"
        >
            <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
        </SafeAreaView>
        </LinearGradient>
    )
}
const styles = StyleSheet.create({
    bodyhome: {
        flex: 1,
    },
    backHeader: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
    },
    userName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    buttonInfo: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        gap: 10,
    },
    menuItem: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 14,
    },
    menuText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    logoutButton: {
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    logoutText: {
        color: '#ff4d4d',
        fontSize: 15,
        fontWeight: '600',
    },
})
