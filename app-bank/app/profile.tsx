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
        <View style={styles.userInfo}>
            <Text>Profile</Text>
            <Text>{user?.firstname} {user?.lastname}</Text>
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
                <Text style={styles.menuText}>💰 Mon budget mensuel</Text>
            </TouchableOpacity>
        </View>
        {/* Bouton de déconnexion */}
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
    userInfo: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 15,
        marginHorizontal: 20,
        alignSelf: 'flex-start',
    },
    logoutText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
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
})
