import { Ionicons } from '@expo/vector-icons'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'

type Props = {
    title: string
}

export default function BackHeader({ title }: Props) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
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
