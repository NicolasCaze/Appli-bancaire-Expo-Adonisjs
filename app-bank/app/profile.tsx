import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/home/Button";
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
        <Button
            onPress={() => router.push('/(profile)/personal-info')}
            color= "white"
            iconName="user"
            accessibilityRole="button"
            accessibilityLabel="Informations personnelles"
            accessibilityHint="Ouvre la page de vos informations personnelles"
        />
        <Text>Profile</Text>
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
    alignSelf: 'flex-start'
  },
    logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  buttonInfo: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  }
})
