import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function NavBarHome() {
    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => router.push('/profile')}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel="Profil utilisateur"
                    accessibilityHint="Ouvre la page profil"
                >
                    <Ionicons name="person" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.titleContainer} pointerEvents="none">
                <Text style={styles.title}>Finygo</Text>
            </View>

            <View style={styles.rightContainer}>
                <TouchableOpacity
                    style={[styles.iconContainer, styles.marginRight]}
                    onPress={() => Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité arrive prochainement.')}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel="Statistiques"
                    accessibilityHint="Affiche les statistiques de dépenses"
                >
                    <MaterialCommunityIcons name="chart-line" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité arrive prochainement.')}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel="Carte bancaire"
                    accessibilityHint="Accède aux informations de carte"
                >
                    <Ionicons name="card-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 20,
        paddingLeft: 20,
        paddingBottom: 15,
        backgroundColor: 'transparent',
        width: '100%',
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    marginRight: {
        marginRight: 15,
    },
    titleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        paddingBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});