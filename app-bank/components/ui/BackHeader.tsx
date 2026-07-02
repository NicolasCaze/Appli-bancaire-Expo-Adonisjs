import { Ionicons } from '@expo/vector-icons'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'

type Props = {
    title: string
}

export default function BackHeader({ title }: Props) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Retour"
                accessibilityHint="Revient à l'écran précédent"
            >
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title} accessibilityRole="header">{title}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10
    },
    backButton: {
        padding: 4
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff'
    }
})
