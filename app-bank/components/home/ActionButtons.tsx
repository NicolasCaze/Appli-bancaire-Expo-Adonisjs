import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

type Props = {
    accountId?: number
}

export default function ActionButtons({ accountId }: Props) {
    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => router.push({ pathname: '/transfer-account', params: { accountId: String(accountId) } })}
                style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Virement entre comptes"
                accessibilityHint="Effectuer un virement vers un autre compte"
            >
                <FontAwesome6 name="plus" size={24} color="#fff" />
            </Pressable>
            <Pressable
                onPress={() => console.log('information')}
                style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Accueil"
                accessibilityHint="Retourner à l'écran d'accueil"
            >
                <FontAwesome6 name="house-chimney" size={24} color="#fff" />
            </Pressable>
            <Pressable
                onPress={() => console.log('dot')}
                style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Plus d'options"
                accessibilityHint="Affiche des options supplémentaires"
            >
                <MaterialCommunityIcons name="dots-horizontal" size={24} color="#fff" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 100,
        flexDirection: 'row',
        gap: 40,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressable: {
        padding: 8,
    },
    pressed: {
        opacity: 0.7,
    },
});
