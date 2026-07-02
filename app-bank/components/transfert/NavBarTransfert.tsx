import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from 'expo-router';


export default function NavBarTransfert() {
    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => router.push('/beneficiaires')}
                    accessibilityRole="button"
                    accessibilityLabel="Mes bénéficiaires"
                    accessibilityHint="Gérer vos bénéficiaires enregistrés"
                >
                    <Ionicons name="person" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.rightContainer}>
                <TouchableOpacity
                    style={[styles.iconContainer, styles.marginRight]}
                    onPress={() => router.push('/virements-programmes')}
                    accessibilityRole="button"
                    accessibilityLabel="Virements programmés"
                    accessibilityHint="Consulter et gérer vos virements programmés"
                >
                    <Ionicons name="calendar-clear" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => router.push('/transfer-beneficiaire')}
                    accessibilityRole="button"
                    accessibilityLabel="Nouveau virement vers un bénéficiaire"
                    accessibilityHint="Effectuer un virement vers un bénéficiaire"
                >
                    <Ionicons name="add" size={24} color="white" />
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
});